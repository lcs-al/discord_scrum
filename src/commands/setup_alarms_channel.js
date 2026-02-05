const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { DATA_BASE_URL } = process.env;

const instance = axios.create({
    baseURL: DATA_BASE_URL
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_alarms_channel')
        .setDescription('Set the current channel as the AWS SNS Alarms channel'),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channelId = interaction.channelId;

        try {
            // First validation: Ensure we can read the current config or create one
            let config = {};
            try {
                const res = await instance.get(`/configs/${guildId}.json`);
                if (res.data) config = res.data;
            } catch (error) {
                // If 404/null, we start with empty object. 
                // Any other error we might want to log, but let's proceed to try and save
            }

            // Update configuration
            config.alarms_channel_id = channelId;

            // Persist
            await instance.patch(`/configs/${guildId}.json`, config);

            await interaction.reply({ 
                content: `✅ **AWS SNS Alarms** configured successfully!\nNotifications will now be sent to <#${channelId}>.`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error saving alarm channel:', error);
            await interaction.reply({ 
                content: '❌ Failed to save configuration. Please try again later.', 
                ephemeral: true 
            });
        }
    },
};
