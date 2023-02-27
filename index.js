const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');
const Client = require('./utils/client.js');
const server = require('./api/index');

(async () => {
const client = await Client.getClient();

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction, client);
		if(interaction.commandName === 'setup_daily') client.isDailyRunning = true
		if(interaction.commandName === 'finish_daily') client.isDailyRunning = false
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

process.on('uncaughtException', err => {
	console.log(`Uncaught Exception: ${err.message}`)
	process.exit(1)
})

server.startServer();
})()