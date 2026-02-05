const axios = require('axios');
const Client = require("../../utils/client");
const { EmbedBuilder } = require('discord.js');
const { DATA_BASE_URL, JIRA_URL } = process.env;

const db = axios.create({
  baseURL: DATA_BASE_URL,
});

class ReleaseService {
  constructor() {
    this.createClient();
  }

  async createClient() {
    this.client = await Client.getClient();
  }

  async create(data) {
    if (!this.client) await this.createClient();
    
    const guild = this.client.guilds.cache.first();
    if (!guild) {
        console.error("Bot is not in any guild! Cannot send release status.");
        return { error: 'Bot inactive' };
    }

    // Fetch config
    let config;
    try {
        const res = await db.get(`/configs/${guild.id}.json`);
        config = res.data;
    } catch (e) {
        console.error("Error fetching config:", e);
        return { error: 'Config fetch failed' };
    }

    if (!config || !config.release_channel_id) {
        console.error("Release status channel not configured/found.");
        return { error: 'Channel not configured' };
    }

    const channel = await guild.channels.fetch(config.release_channel_id);
    if (!channel) {
        console.error(`Release channel ${config.release_channel_id} not found/accessible.`);
        return { error: 'Channel not accessible' };
    }

    // Group issues by type
    // Desired map:
    // História -> Histórias
    // Problema -> Correções
    // Deploy -> Deploys
    const typeMap = {
        'História': 'Histórias',
        'Problema': 'Correções',
        'Deploy': 'Deploys'
    };
    
    // Sort logic order: Deploy -> Problema -> História (or any preferred logic, user didn't specify sort order, just grouping)
    // Let's iterate the types present.
    const grouped = {};
    
    data.issues.forEach(issue => {
        const mappedType = typeMap[issue.type] || issue.type;
        if (!grouped[mappedType]) grouped[mappedType] = [];
        grouped[mappedType].push(issue);
    });

    const fields = [];
    
    // Ensure "Histórias", "Correções", "Deploys" order if present?
    // User list: História, Problema, Deploy.
    // Let's iterate based on priority keys if we want consistent ordering.
    const order = ['Histórias', 'Correções', 'Deploys'];
    
    // Add keys from order
    order.forEach(key => {
        if (grouped[key]) {
            const issues = grouped[key];
            const issueText = issues
              .map((i) => `[${i.key}](${i.url})︱${i.title}`)
              .join("\n");
            fields.push({ name: key, value: issueText });
            delete grouped[key];
        }
    });

    // Add remaining keys (if any unknown types appeared, though user said "Não inventar novos tipos")
    // Safe fallback just in case
    Object.keys(grouped).forEach(key => {
        const issues = grouped[key];
        const issueText = issues
          .map((i) => `[${i.key}](${i.url})︱${i.title}`)
          .join("\n");
        fields.push({ name: key, value: issueText });
    });

    const URL = `${JIRA_URL}/projects/${data.project.key}/versions/${data.id}/tab/release-report-all-issues`

    const embed = new EmbedBuilder()
        .setTitle(`🚀 Release Notes: ${data.version}`)
        .setURL(URL)
        .setDescription(`Tarefas subindo: ${data.total}`)
        .setColor(0x2ecc71) // Green
        .addFields(fields)
        .setTimestamp();

    await channel.send({ embeds: [embed] });
    return { status: "sent" };
  }
}

module.exports = ReleaseService;
