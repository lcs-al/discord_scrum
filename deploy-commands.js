const fs = require('node:fs');
const path = require('node:path');
require("dotenv").config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

const commands = [];
const commandsPath = path.join(__dirname, "src", "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(CLIENT_TOKEN);

rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);