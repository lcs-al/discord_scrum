const axios = require('axios');
const Client = require("../../utils/client");
const { EmbedBuilder } = require("discord.js");
const { DATA_BASE_URL } = process.env;

const db = axios.create({
  baseURL: DATA_BASE_URL,
});

class TicketService {
  constructor() {
    this.createClient();
  }

  async createClient() {
    this.client = await Client.getClient();
  }

  async create(data) {
    const { key, self, fields } = data.issue;
    const {
      summary,
      description,
      priority,
      issuetype,
      status,
      creator,
      assignee,
      attachment,
    } = fields;
    const reporter = data.user;

    const baseUrl = self.split("/rest/api")[0];
    const jiraLink = `${baseUrl}/browse/${key}`;
    const typeIcon = issuetype ? issuetype.iconUrl : null;
    const embedColor = 0xe74c3c; // red

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${key}: ${summary}`)
      .setURL(jiraLink)
      .setAuthor({
        name: reporter.displayName,
        iconURL: reporter.avatarUrls["48x48"],
      })
      .setThumbnail(typeIcon)
      .addFields(
        { name: "Status", value: status.name, inline: true },
        {
          name: "Priority",
          value: priority ? priority.name : "None",
          inline: true,
        },
        {
          name: "Assignee",
          value: assignee ? assignee.displayName : "Unassigned",
          inline: true,
        },
      )
      .setTimestamp(new Date(data.timestamp));

    if (description) {
      // Truncate description if too long (Discord limit is 4096, but let's keep it shorter for preview)
      const cleanDesc =
        description.length > 300
          ? description.substring(0, 297) + "..."
          : description;
      embed.setDescription(cleanDesc);
    }

    if (attachment && attachment.length > 0) {
      const fileNames = attachment
        .map((a) => `[${a.filename}](${a.content})`)
        .join("\n");
      embed.addFields({ name: "Attachments", value: fileNames });
    }

    const content = {
      content: "@here Novo chamado!",
      embeds: [embed],
    };

    try {
      if (!this.client) await this.createClient();

      const guild = this.client.guilds.cache.first();
      if (!guild) {
        console.error("Bot is not in any guild");
        return;
      }

      const res = await db.get(`/configs/${guild.id}.json`);
      const config = res.data;

      if (!config || !config.ticket_channel_id) {
        console.warn(`No ticket_channel_id configured for guild ${guild.name}`);
        return;
      }

      const channel = await guild.channels.fetch(config.ticket_channel_id);
      if (channel) {
        await channel.send(content);
      } else {
        console.warn(`Ticket channel ${config.ticket_channel_id} not found`);
      }
    } catch (error) {
      console.error("Error sending ticket notification:", error);
    }

    return { status: "ok" };
  }
}

module.exports = TicketService;
