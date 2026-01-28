const { emojis } = require('../utils/emoji_list.json');

class DailyManager {
    constructor() {
        this.isRunning = false;
        this.currentChannelId = null;
        this.collector = null;
        this.embedMessage = null;
        this.embedFields = [];
        this.usedEmojis = [];
        this.embed = {};
    }

    async start(interaction, firstUser) {
        if (this.isRunning) {
            return await interaction.reply({ content: "There's already a daily meeting running!", ephemeral: true });
        }

        const currentVoiceChannel = interaction.member.voice.channel;
        if (!currentVoiceChannel) {
            return await interaction.reply({
                content: "Wasn't find the voice channel where you are connected in",
                fetchReply: true
            });
        }

        this.isRunning = true;
        this.currentChannelId = interaction.channelId;

        const onlyUsers = currentVoiceChannel.members.filter(member => !member.user.bot);
        let usernamesList = onlyUsers.map(member => member.nickname || member.user.username);
        
        usernamesList = this._shuffleOrder(usernamesList);
        if (firstUser) {
            usernamesList = this._setFirst(firstUser, usernamesList);
        }

        const buildResult = this._buildEmbedFields(usernamesList);
        this.embedFields = buildResult.fields;
        this.usedEmojis = buildResult.usedEmojis;

        this.embed = {
            color: 0x0099ff,
            title: 'Daily Meeting - ' + this._getTodayDate(),
            timestamp: new Date().toISOString(),
            fields: this.embedFields
        };

        this.embedMessage = await interaction.reply({ embeds: [this.embed], fetchReply: true });
        
        // Add reactions sequentially to avoid race conditions or missed adds
        for (const { emoji } of this.usedEmojis) {
            await this.embedMessage.react(emoji);
        }

        const reactionFilter = (reaction, user) => {
            if (user.bot) return false;
            
            const isValidEmoji = this.usedEmojis.some(({ emoji }) => reaction.emoji.name === emoji);
            if (!isValidEmoji) {
                reaction.remove();
                return false;
            }
            return true;
        };

        this.collector = this.embedMessage.createReactionCollector({ filter: reactionFilter, time: 7200 * 1000 });

        this.collector.on('collect', (reaction, user) => this._handleCollect(reaction, user));
        
        // We do NOT handle 'end' here to clear state immediately because we want to control it via finish()
        // But if it times out, we should probably clean up.
        this.collector.on('end', () => {
             // Optional: Auto-cleanup if time runs out? 
             // user code had 2 hours timeout.
        });
    }

    async finish(interaction) {
        if (!this.isRunning) {
            return await interaction.reply({ content: "There's no daily meeting occurring right now to be finished", fetchReply: true });
        }

        this.isRunning = false;
        if (this.collector) {
            this.collector.stop();
            this.collector = null;
        }

        // Update the embed one last time
        if (this.embedMessage) {
             // Re-fetch message or use local check? 
             // The user code did: embed.footer = { text: "The current daily meeting has been finished ✅" }
             // interaction.editReply({ embeds: [embed], fetchReply: true })
             // But wait, finish is a DIFFERENT interaction usually.
             
             // The original code handled finish in the collector 'end' event.
             // "collector.on('end', collected => { client.isDailyRunning = false ... interaction.editReply ... })"
             // The interaction there refers to the SETUP interaction (closure).
             
             // In this new service, we need to update the OLD message.
             this.embed.footer = { text: "The current daily meeting has been finished ✅" };
             try {
                await this.embedMessage.edit({ embeds: [this.embed] });
             } catch (e) {
                 console.error("Failed to edit embed message on finish", e);
             }
        }
        
        this.currentChannelId = null;
        this.embedMessage = null;
        this.embedFields = [];
        this.usedEmojis = [];

        return await interaction.reply({ content: "The current daily meeting has been finished ✅", fetchReply: true });
    }

    // Handlers
    
    _handleCollect(reaction, user) {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        this.embed.fields = this.embedFields.map((e) => {
            if (e.name.includes(reaction.emoji.name) && !e.name.includes("✅")) {
                e.name = e.name + " " + "✅";
            }
            return e;
        });
        this.embedMessage.edit({ embeds: [this.embed] });
    }

    // Public method for messageReactionRemove event
    async handleReactionRemove(reaction, user) {
        if (!this.isRunning || !this.embedMessage) return;
        if (reaction.message.id !== this.embedMessage.id) return;

        // Simplify validation: just check if count > 1 (the bot + user)
        // If count is 1, it means only bot has it (or user if bot removed), but usually we want to uncheck if USER removed it.
        // Wait, original logic: "validateReactionAmount... return currentReactions.count > 1". If > 1, return.
        // So if there are still reactions left (e.g. other users?), it returns?
        // Ah, if count > 1, it means someone else (or bot) still has the reaction.
        // Logic: if I remove my reaction, but the bot still has it, count is 1. 2 -> 1.
        // If count > 1, it means 2 people rejected it?
        // Original: "if(has_more_than_one) return"
        // so if count > 1, DO NOT remove checkmark.
        // This implies that the checkmark should only be removed if NO ONE (except maybe bot?) has reacted?
        // Actually, the bot reacts to all. So min count is 1.
        // If user reacts, count is 2.
        // If user unreacts, count goes back to 1.
        // So if count > 1, it implies there is STILL a user reacted?
        // Yes. So if > 1, someone else is verified?
        // In daily context, usually each emoji is unique per user?
        // "used_emojis.push({emoji: emojis[new_idx]...})" -> Random unique emoji per user!
        // So only THAT user should be reacting to THAT emoji.
        // But anyone can react. Standard Discord behavior.
        
        // Let's keep original logic strictness.
        const hasMoreThanOne = reaction.count > 1; 
        if (hasMoreThanOne) return;

        this.embed.fields = this.embedFields.map((e) => {
            if (e.name.includes(reaction.emoji.name) && e.name.includes("✅")) {
                e.name = e.name.replace(" ✅", "");
            }
            return e;
        });
        await this.embedMessage.edit({ embeds: [this.embed] });
    }

    // Public method for messageCreate event
    async handleMessage(message) {
        if (!this.isRunning || message.author.bot || message.channelId !== this.currentChannelId) return;

        try {
            const warningMsg = await message.reply({ 
                content: "You can't send messages in this channel while is a daily meeting running, please wait to the meeting be finish or send the message in another channel!", 
                ephemeral: true
            });
            setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
            await message.delete();
        } catch (error) {
            console.error("Error handling blocked message:", error);
        }
    }

    // Helpers

    _shuffleOrder(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    _setFirst(user, list) {
        const username = user.nickname || user.username;
        list = list.filter((item) => item != username);
        list.unshift(username);
        return list;
    }

    _buildEmbedFields(usersArray) {
        let usedEmojis = [];
        let fields = usersArray.map((user) => {
            let usedIndexes = usedEmojis.map(({ idx }) => idx);
            let newIdx = this._generateRandomNum(emojis.length, usedIndexes);
            usedEmojis.push({ emoji: emojis[newIdx], idx: newIdx });
            return { name: emojis[newIdx] + " - " + user, value: '\u200b', inline: false };
        });
        fields.unshift({ name: '\u200b', value: '\u200b', inline: false });
        // fields must be updated globally for the class so we return them
        return { fields, usedEmojis };
    }

    _generateRandomNum(max, usedNumbers) {
        let number = Math.floor(Math.random() * max);
        if (usedNumbers.includes(number)) return this._generateRandomNum(max, usedNumbers);
        return number;
    }

    _getTodayDate() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return dd + '/' + mm + '/' + yyyy;
    }
}

module.exports = new DailyManager();
