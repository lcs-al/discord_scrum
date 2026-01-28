const Client = require('../../utils/client');
const devs = require("../../../assets/devs.json");

class CommentService {
  constructor() {
    this.createClient();
    this.devs = devs;
  }

  async createClient() {
    const client = await Client.getClient();
    this.client = client;

    const guild = await client.guilds.fetch('740596666955989042');
    const channel = await guild.channels.fetch('979389580551790652');
    const members = channel.members.map(({user: { username, id }}) => ({ username, id }));

    this.members = members;
  }

  findDiscordId(name) {
    const user = this.devs.find((user) => user.name === name);
    return user;
  }

  async sendMessage(data) {
    const { 
      comment_author,
      pullrequest_title,
      pullrequest_key,
      discord_user,
      comment,
      link
    } = data;

    const content = `
💬 Novo comentario de **${comment_author}** em **${pullrequest_title} | ${pullrequest_key}**

**${comment_author}** 🗣️: "${comment}"

🔗 Link: ${link}
    `.trim();

    const user = await this.client.users.fetch(discord_user.id);
    user.send(content)

    return content;
  }

  async create_issue(data) {
    const { 
      issue: { 
        key: pullrequest_key,
        fields: { 
          summary: pullrequest_title,
          assignee: { displayName: pullrequest_owner, accountId } 
        }
      },
      comment: {
        author: { displayName: comment_author },
        body: comment
      }
    } = data;

    const discord_user = this.findDiscordId(pullrequest_owner);
    if (!discord_user) return;

    const link = `https://vollsolutions.atlassian.net/jira/software/projects/V2/boards/30?assignee=${accountId}&selectedIssue=${pullrequest_key}`;

    const content = await this.sendMessage({ 
      pullrequest_title,
      pullrequest_key,
      comment_author,
      comment,
      discord_user,
      link
    });

    return content;
  }

  async create_pullrequest(data) {
    const { 
      repository: { uuid: repo_id },
      pullrequest: { 
        id: pullrequest_id, 
        title: pullrequest_title,
        title: pullrequest_key,
        author: { nickname: pullrequest_owner }
      },
      comment: { content: { raw: comment } },
      actor: { display_name: comment_author }
    } = data;

    const discord_user = this.findDiscordId(pullrequest_owner);
    if (!discord_user) return;
    const link = `https://bitbucket.org/callsave/${repo_id}/pull-requests/${pullrequest_id}`;
    
    const content = await this.sendMessage({ 
      pullrequest_title,
      pullrequest_key,
      comment_author,
      comment,
      discord_user,
      link
    });

    return content;
  }

}

module.exports = CommentService;
