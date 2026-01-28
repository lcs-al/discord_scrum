const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { DATA_BASE_URL } = process.env;

const instance = axios.create({
    baseURL: DATA_BASE_URL
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devs')
        .setDescription('Manage the developers list')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all registered developers'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Associate a Discord user with a nickname')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The Discord user')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('nickname')
                        .setDescription('The nickname to link')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a developer from the list')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The Discord user to remove')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'set') {
            await setDev(interaction, guildId);
        } else if (subcommand === 'list') {
            await listDevs(interaction, guildId);
        } else if (subcommand === 'remove') {
            await removeDev(interaction, guildId);
        }
    },
};

async function setDev(interaction, guildId) {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');

    try {
        await instance.patch(`/devs/${guildId}.json`, { 
            [user.id]: { nickname, id: user.id } 
        });
        await interaction.reply({ content: `✅ **${user.username}** associated with nickname **${nickname}**.`, ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Failed to save configuration.', ephemeral: true });
    }
}

async function listDevs(interaction, guildId) {
    try {
        const res = await instance.get(`/devs/${guildId}.json`);
        const devs = res.data;

        if (!devs) {
            return await interaction.reply({ content: 'ℹ️ No developers registered yet.', ephemeral: true });
        }

        const fields = Object.values(devs).map(dev => ({
            name: dev.nickname,
            value: `<@${dev.id}>`,
            inline: true
        }));

        const embed = new EmbedBuilder()
            .setTitle('👥 Registered Developers')
            .setColor(0x0099ff)
            .addFields(fields)
            .setFooter({ text: `Total: ${fields.length}` });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Failed to fetch list.', ephemeral: true });
    }
}

async function removeDev(interaction, guildId) {
    const user = interaction.options.getUser('user');

    try {
        // To delete a key in Firebase, we can set it to null or use DELETE method on the specific node
        await instance.delete(`/devs/${guildId}/${user.id}.json`);
        await interaction.reply({ content: `🗑️ Removed **${user.username}** from developers list.`, ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Failed to remove developer.', ephemeral: true });
    }
}
