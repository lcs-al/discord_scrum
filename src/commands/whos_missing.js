const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whos_missing')
		.setDescription("Show the users that haven't joined in the voice channel yet"),
	async execute(interaction, client) { 
        var channel_id = interaction.channelId;
        var channel = client.channels.cache.get(channel_id);

        var only_users = channel.members.filter(member => !member.user.bot)
        var channel_members = only_users.map(e => {
            return e.user.id
        });

        var current_voice_channel = interaction.member.voice.channel
        if(!current_voice_channel) {
            await interaction.reply({ content: "Wasn't find the voice channel where you are connected in", fetchReply: true });
            return
        }

        var in_channel_members_list = current_voice_channel.members.map( member => {
            return  member.user.id
        });

        var missing_message = "The following users still not connected to the daily meeting: " + "\u200b"
        var missing_list = []

        channel_members.forEach(user => {
            if(!in_channel_members_list.includes(user)){
                missing_list.push(user)
                missing_message = missing_message + `<@${user}>` + ", " + "\u200b"
            }
        });

        var attendance_message = 'Everybody is present on the voice call! 😉'
        var message_content = missing_list.length > 0 ? missing_message : attendance_message
        
		await interaction.reply({ content: message_content, fetchReply: true });
	},
};