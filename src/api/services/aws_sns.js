const axios = require('axios');
const Client = require("../../utils/client");
const { EmbedBuilder } = require('discord.js');
const { DATA_BASE_URL } = process.env;

const db = axios.create({
  baseURL: DATA_BASE_URL,
});

class AwsSnsService {
    constructor() {
        this.createClient();
    }

    async createClient() {
        this.client = await Client.getClient();
    }

    async getChannel() {
        if (!this.client) await this.createClient();

        const guild = this.client.guilds.cache.first();
        if (!guild) {
            console.error("Bot is not in any guild! Cannot send SNS notification.");
            return null;
        }

        try {
            const res = await db.get(`/configs/${guild.id}.json`);
            const config = res.data;
            
            if (!config || !config.alarms_channel_id) {
                console.warn("Alarms channel not configured.");
                return null;
            }

            const channel = await guild.channels.fetch(config.alarms_channel_id);
            return channel;
        } catch (error) {
            console.error("Error fetching alarm channel config:", error);
            return null;
        }
    }

    async handleSubscription(payload) {
        const channel = await this.getChannel();
        if (!channel) return;

        const subscribeUrl = payload.SubscribeURL;
        const message = `📡 **AWS SNS Subscription Confirmation**\n\nPlease confirm the subscription by clicking the link below:\n${subscribeUrl}`;

        await channel.send(message);
    }

    async handleNotification(payload) {
        const channel = await this.getChannel();
        if (!channel) return;

        const subject = payload.Subject || 'AWS Alarm';
        const message = payload.Message;
        const timestamp = payload.Timestamp;
        const topicArn = payload.TopicArn;

        const embed = new EmbedBuilder()
            .setTitle(`🚨 ${subject}`)
            .setDescription(message)
            .setColor(0xFF0000) // Red
            .addFields(
                { name: 'Topic ARN', value: topicArn, inline: false },
                { name: 'Timestamp', value: new Date(timestamp).toLocaleString(), inline: false }
            )
            .setFooter({ text: 'AWS SNS' })
            .setTimestamp(new Date(timestamp));

        await channel.send({ embeds: [embed] });
    }
}

module.exports = AwsSnsService;
