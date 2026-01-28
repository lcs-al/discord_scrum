const Client = require("../../utils/client");
const axios = require("axios");
const { DATA_BASE_URL } = process.env;

const db = axios.create({
  baseURL: DATA_BASE_URL,
});

class CommentService {
  constructor() {
    this.createClient();
  }

  async createClient() {
    this.client = await Client.getClient();
  }

  async findDiscordUserByNickname(nickname) {
    if (!nickname) return null;

    try {
      if (!this.client) await this.createClient();

      const guild = this.client.guilds.cache.first();
      if (!guild) {
        console.error("Bot is not in any guild! Cannot lookup devs.");
        return null;
      }

      const res = await db.get(`/devs/${guild.id}.json`);
      const devs = res.data; // Object: { "userId": { email, id } } or null
      if (!devs) return null;
      const devEntry = Object.values(devs).find(
        (dev) =>
          dev.nickname && dev.nickname.toLowerCase() === nickname.toLowerCase(),
      );

      if (devEntry && devEntry.id) {
        return await this.client.users.fetch(devEntry.id);
      }
    } catch (error) {
      console.error("Error looking up user by email:", error);
    }
    return null;
  }

  async sendMessage(data) {
    const { EmbedBuilder } = require("discord.js");
    const {
      comment_author,
      pullrequest_title,
      pullrequest_key,
      discord_user,
      comment,
      link,
    } = data;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`💬 Novo comentário em: ${pullrequest_title}`)
      .setURL(link)
      .setAuthor({ name: comment_author })
      .setDescription(
        comment.length > 2000 ? comment.substring(0, 1997) + "..." : comment,
      )
      .addFields(
        { name: "PR/Issue", value: `${pullrequest_key}`, inline: true },
        { name: "Link", value: `[Acessar](${link})`, inline: true },
      )
      .setTimestamp();

    const content = {
      content: `Olá <@${discord_user.id}>, você recebeu um novo comentário!`,
      embeds: [embed],
    };

    try {
      await discord_user.send(content);
    } catch (error) {
      console.error(`Failed to send DM to user ${discord_user?.id}:`, error);
    }

    return "Message sent";
  }

  async create_pullrequest(data) {
    const {
      repository: { full_name: full_name },
      pullrequest: {
        id: pullrequest_id,
        title: pullrequest_title,
        author, // author object
      },
      comment: {
        content: { raw: comment },
      },
      actor: { display_name: comment_author },
    } = data;

    const discord_user = await this.findDiscordUserByNickname(
      author.display_name,
    );

    if (!discord_user) {
      console.log(`User not registered for nickname: ${author.display_name}`);
      return {
        error: `User not registered for nickname: ${author.display_name}`,
      };
    }

    const link = `https://bitbucket.org/${full_name}/pull-requests/${pullrequest_id}`;

    const content = await this.sendMessage({
      pullrequest_title,
      pullrequest_key: pullrequest_title,
      comment_author,
      comment,
      discord_user,
      link,
    });

    return content;
  }
}

module.exports = CommentService;
