const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { DATA_BASE_URL } = process.env;

const instance = axios.create({
    baseURL: DATA_BASE_URL
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_release_channel')
        .setDescription('Sets the channel where release notes will be announced')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to send release notifications to')
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        
        if (!channel.isTextBased()) {
            return await interaction.reply({ content: 'Please select a text channel.', ephemeral: true });   
        }

        const guildId = interaction.guild.id;

        try {
            // Save to Firebase under /configs/{guild_id}.json with key release_channel_id
            await instance.patch(`/configs/${guildId}.json`, { release_channel_id: channel.id });
            
            await interaction.reply({ content: `✅ Release notifications will now be sent to ${channel}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Failed to save configuration.', ephemeral: true });
        }
    },
};
