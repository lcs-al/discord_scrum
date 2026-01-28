const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const message = await interaction.reply({content: 'pong!', fetchReply: true })

		message.react('🏓')
	},
};