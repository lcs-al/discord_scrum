const { CLIENT_TOKEN } = require('../config.json');
const { Client } = require('discord.js');

class DiscordClient {
  async createClient() {
    const client = new Client({ intents: 32767 });
	  await client.login(CLIENT_TOKEN);

    return client;
  }

  static async getClient() {
    const discord = new DiscordClient();
    const client = await discord.createClient();
    return client;
  }
}

module.exports = DiscordClient;
