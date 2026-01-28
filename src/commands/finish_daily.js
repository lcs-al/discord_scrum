const { SlashCommandBuilder } = require('discord.js');
const DailyManager = require('../services/DailyManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('finish_daily')
		.setDescription("If there's a daily running, this command will finish the current daily"),
	async execute(interaction) {  
        await DailyManager.finish(interaction);
	},
};