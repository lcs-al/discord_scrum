const { SlashCommandBuilder } = require('discord.js');
const DailyManager = require('../services/DailyManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup_daily')
		.setDescription('Start a daily meeting')
        .addUserOption(option => option.setName('goes_first').setDescription('The user who goes first in the daily meeting')),
	async execute(interaction) {  
        const firstUser = interaction.options.getUser('goes_first');
        await DailyManager.start(interaction, firstUser);
	},
};