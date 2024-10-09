const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('finish_daily')
		.setDescription("If there's a daily running, this command will finish the current daily"),
	async execute(interaction, client) {  
        var current_voice_channel = interaction.member.voice.channel
        if(!current_voice_channel) {
            await interaction.reply({ content: "Wasn't find the voice channel where you are connected in", fetchReply: true });
            return
        }

        if(!client.isDailyRunning) return await interaction.reply({ content: "There's no daily meeting occurring right now to be finished", fetchReply: true })
        return await interaction.reply({ content: "The current daily meeting has been finished ✅", fetchReply: true })
	},
};