const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const pong = Date.now() - interaction.createdTimestamp;
		//adding unecessary comment
		const message = await interaction.reply({content: `Pong! Latency is ${peng}ms.`, fetchReply: true })
		message.react('🏓')
	},
};