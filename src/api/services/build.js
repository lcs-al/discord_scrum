const axios = require('axios');
const Client = require("../../utils/client");
const { DATA_BASE_URL } = process.env;

const db = axios.create({
  baseURL: DATA_BASE_URL,
});

class BuildService {
  constructor() {
    this.createClient();
  }

  async createClient() {
    this.client = await Client.getClient();
  }

  async findDiscordUserByNickname(guildId, nickname) {
    if (!nickname) return null;
    try {
      const res = await db.get(`/devs/${guildId}.json`);
      const devs = res.data;
      if (!devs) return null;

      const devEntry = Object.values(devs).find(
        (dev) =>
          dev.nickname && dev.nickname.toLowerCase() === nickname.toLowerCase(),
      );
      if (devEntry && devEntry.id) {
        return await this.client.users.fetch(devEntry.id);
      }
    } catch (e) {
      console.error("Error finding user by nickname:", e);
    }
    return null;
  }

  async create(data) {
    if (!this.client) await this.createClient();

    const guild = this.client.guilds.cache.first();
    if (!guild) return;

    const refname = data.push
      ? data.push.changes[0].new.name
      : data.refname || (data.ref ? data.ref.split("/").pop() : "unknown");
    const branch = data.refname || "unknown";

    const isMaster = branch === "master" || branch === "main";
    const isRelease = branch.includes("release") || branch.includes("hotfix");
    const isProduction = isMaster || isRelease;
    const isFailure = data.state === "FAILED";
    const isSuccess = data.state === "SUCCESSFUL";

    // 1. Production (Master/Release) -> Channel
    if (isProduction) {
      // Fetch config
      let config;
      try {
        const res = await db.get(`/configs/${guild.id}.json`);
        config = res.data;
      } catch (e) {
        console.error(e);
        return;
      }

      if (!config || !config.deploy_channel_id) return;
      const channel = await guild.channels.fetch(config.deploy_channel_id);
      if (!channel) return;

      // Construct Embed
      const author = {
        name: data.commit.author.user.display_name,
        icon_url: data.commit.author.user.links.avatar.href,
      };
      const fields = [
        { name: "Pipeline", value: `${data.name} ${data.url}` },
        { name: "Commit", value: `${data.commit.message}` },
        { name: "Branch", value: branch },
      ];

      let embed = {};

      if (isFailure) {
        if (isRelease) {
          // Critical Release Failure
          embed = {
            url: data.url,
            title: `🚨 FALHA CRÍTICA EM DEPLOY DE PRODUÇÃO 🚨`,
            description: `O deploy da release **${branch}** falhou! Verifique imediatamente. @here`,
            color: 0xff0000, // Red
            fields,
            author,
            thumbnail: {
              url: "https://media.tenor.com/QCWto5N6k0EAAAAM/caos-bob.gif",
            },
          };
        } else {
          // Master Failure
          embed = {
            url: data.url,
            description: `🚨 MASTER do ${data.repository.name} quebrou! 🚨 @here`,
            color: 15548997,
            fields,
            author,
            thumbnail: {
              url: "https://media.istockphoto.com/id/1026659838/vector/broken-metal-pipe-with-leaking-water.jpg?s=170667a&w=0&k=20&c=YQhtmo5CDO3rVbgLqCn2gXdVfO6Xl_QJCvTQbmlShPs=",
            },
            image: {
              url: "https://media.tenor.com/QCWto5N6k0EAAAAM/caos-bob.gif",
              height: 220,
              width: 165,
            },
          };
        }
      } else if (isSuccess) {
        // Success (Same for Master/Release)
        embed = {
          url: data.url,
          description: `✅ ${branch} do ${data.repository.name} tá top! ✅`,
          color: 5763719,
          fields,
          author,
          thumbnail: {
            url: "https://media.istockphoto.com/id/900561772/pt/vetorial/sewerage-water-system-flat-design.jpg?s=1024x1024&w=is&k=20&c=RWZeTL2rzbgcl6bDIRglyPSBAuxs7bgD2tyjgs_NsT0=",
          },
          image: {
            url: "https://media.tenor.com/O-oMeJG2n8QAAAAC/spongebob-rainbow.gif",
            height: 220,
            width: 165,
          },
        };
      }

      if (embed.description || embed.title) {
        await channel.send({ embeds: [embed] });
      }
    }
    // 2. Feature Branch -> DM (Only on Failure)
    else if (isFailure) {
      const authorName = data.commit.author.user.display_name;
      const discordUser = await this.findDiscordUserByNickname(
        guild.id,
        authorName,
      );

      if (discordUser) {
        const embed = {
          title: `❌ Falha no Pipeline: ${branch}`,
          url: data.url,
          description: `O pipeline da sua branch **${branch}** falhou.`,
          color: 15548997,
          fields: [
            { name: "Pipeline", value: `[Link](${data.url})` },
            { name: "Commit", value: data.commit.message },
          ],
          footer: { text: `Repository: ${data.repository.name}` },
        };

        try {
          await discordUser.send({
            content: `Olá ${authorName}, seu build falhou!`,
            embeds: [embed],
          });
        } catch (e) {
          console.error(`Could not DM user ${authorName}`);
        }
      } else {
        console.log(`User ${authorName} not found directly for DM.`);
      }
    }

    return { status: "processed" };
  }
}

module.exports = BuildService;
