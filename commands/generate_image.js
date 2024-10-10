const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate_image')
		.setDescription('Generates a random image from LoremPixel'),
		
	async execute(interaction) {
		// The URL for a random image from LoremPixel
		const imageUrl = 'http://lorempixel.com/400/200';

		try {
			// Fetch the image using axios
			const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

			// If the request was successful, reply with the image as a file attachment
			if (response.status === 200) {
				const buffer = Buffer.from(response.data, 'binary'); // Convert response data to a buffer
				await interaction.reply({ content: 'Here is your random image:', files: [{ attachment: buffer, name: 'random_image.jpg' }] });
			} else {
				await interaction.reply('Failed to fetch an image. Please try again later.');
			}
		} catch (error) {
			// In case of any error during the fetch, reply with an error message
			console.error(error);
			await interaction.reply('An error occurred while generating the image. Please try again later.');
		}
	},
};