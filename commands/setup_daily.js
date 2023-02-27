const { SlashCommandBuilder } = require('discord.js');
const { emojis } = require('../emoji_list.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup_daily')
		.setDescription('Show a list of all users in the voice channel')
        .addUserOption(option => option.setName('goes_first').setDescription('The user who goes first in the daily meeting')),
	async execute(interaction, client) {  
        const current_voice_channel = interaction.member.voice.channel
        if(!current_voice_channel) {
            await interaction.reply({
                content: "Wasn't find the voice channel where you are connected in",
                fetchReply: true
            });
            return
        }

        if(client.isDailyRunning) return await interaction.reply({ content: "There's already a daily meeting running!", ephemeral: true })
        const first_user = interaction.options.getUser('goes_first');
        const interaction_channel_id = interaction.channelId
        const only_users = current_voice_channel.members.filter(member => !member.user.bot)
        var usernames_list = only_users.map( member => {
            var username = member.nickname || member.user.username;
            return username
        });
        usernames_list = shuffleOrder(usernames_list)
        if (first_user) usernames_list = setFirst(first_user, usernames_list)
        
        var [embed_fields, used_emojis] = buildEmbedFields(usernames_list)

        const embed = {
            color: 0x0099ff,
            title: 'Daily Meeting - ' + getTodayDate(),
            timestamp: new Date().toISOString(),
            fields: embed_fields
        } 

		const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        used_emojis.forEach(({emoji}) => {
            message.react(emoji);
        })

        const reactionFilter = (reaction, user) => {
            if (!user.bot && used_emojis.some(({emoji}) => reaction.emoji.name === emoji)) return true
            else if(!used_emojis.some(({emoji}) => reaction.emoji.name === emoji)){
                reaction.remove()
                return false
            }
        };

        const collector = message.createReactionCollector({ filter: reactionFilter , time: 7200*1000 });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            embed.fields = embed_fields.map((e) => {
                if(e.name.includes(reaction.emoji.name) && !e.name.includes("✅")) {
                    e.name = e.name + " " + "✅"
                }
                return e
            })
            
            message.edit({ embeds: [embed], fetchReply: true });
        });
        
        collector.on('end', collected => {
            client.isDailyRunning = false
            embed.footer = { text: "The current daily meeting has been finished ✅" }
            interaction.editReply({ embeds: [embed], fetchReply: true })
        });


        client.on("messageReactionRemove", (reaction, user) => {
            if(reaction.message.id !== message.id) return
            var has_more_than_one = validateReactionAmount(message.reactions.cache, reaction.emoji.name)
            if(has_more_than_one) return

            embed.fields = embed_fields.map((e) => {
                if(e.name.includes(reaction.emoji.name) && e.name.includes("✅")) {
                    e.name = e.name.replace(" ✅", "")
                }
                return e
            })
            message.edit({ embeds: [embed], fetchReply: true });
        });

        client.on("messageCreate", async (message) => {
            if(!client.isDailyRunning || message.author.bot || message.channelId != interaction_channel_id) return
            await message.reply({ content: "You can't send messages in this channel while is a daily meeting running, please wait to the meeting be finish or send the message in another channel!", ephemeral: true})
                .then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })
            message.delete()
        })
	},
};

function shuffleOrder(array) {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex != 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

function setFirst(user, list){
    var username = user.nickname || user.username;
    list = list.filter((item) => item != username )
    list.unshift(username)
    return list
}

function buildEmbedFields(users_array){
    var used_emojis = []
    var embed_fields = users_array.map((user) => {
        let used_indexes = used_emojis.map(({idx}) => idx)
        let new_idx = generateRandomNum(emojis.length, used_indexes);
        used_emojis.push({emoji: emojis[new_idx], idx: new_idx})
        return { name: emojis[new_idx] + " - " + user,  value: '\u200b', inline: false }
    })
    embed_fields.unshift( { name: '\u200b', value: '\u200b', inline: false} )
    return [embed_fields, used_emojis]
}

function generateRandomNum(max, used_numbers){
    var number = Math.floor(Math.random() * (max - 0) + 0);
    if(used_numbers.includes(number)) number = generateRandomNum(max, used_numbers)
    return number
}

function getTodayDate(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    
    return today = dd + '/' + mm + '/' + yyyy;
}

function validateReactionAmount(messageReactions, removedReaction){
    var currentReactions = messageReactions.find(e => {
        return e.emoji.name === removedReaction
    })

    return currentReactions.count > 1
}