const axios = require('axios');

class BuildService {
  async create(data) {
    if(data.refname !== 'master') return;

    if(data.state === 'FAILED'){
        const image =  {url: 'https://media.tenor.com/QCWto5N6k0EAAAAM/caos-bob.gif', height: 220, width: 165};
        const color = 15548997;
        const thumbnail = {url: 'https://media.istockphoto.com/id/1026659838/vector/broken-metal-pipe-with-leaking-water.jpg?s=170667a&w=0&k=20&c=YQhtmo5CDO3rVbgLqCn2gXdVfO6Xl_QJCvTQbmlShPs='}
        const author = {name: data.commit.author.user.display_name, icon_url: data.commit.author.user.links.avatar.href}	
        const description = `🚨 MASTER do ${data.repository.name} quebrou! 🚨 @here` 
        const fields = [{name: 'Pipeline', value: `${data.name} ${data.url}`}, {name: 'Commit', value: `${data.commit.message}`}]

        const payload = {embeds: [{description, color, image, thumbnail, fields, author}]};
        const response = await axios.post(process.env.WEBHOOK_BUILD_URL, payload);
        return response;
    } else if(data.state === 'SUCCESSFUL'){
        const image =  {url: 'https://media.tenor.com/O-oMeJG2n8QAAAAC/spongebob-rainbow.gif', height: 220, width: 165};
        const color = 5763719;
        const thumbnail = {url: 'https://media.istockphoto.com/id/900561772/pt/vetorial/sewerage-water-system-flat-design.jpg?s=1024x1024&w=is&k=20&c=RWZeTL2rzbgcl6bDIRglyPSBAuxs7bgD2tyjgs_NsT0='}
        const author = {name: data.commit.author.user.display_name, icon_url: data.commit.author.user.links.avatar.href}	
        const description = `✅Master do ${data.repository.name} tá top!✅` 
        const fields = [{name: 'Pipeline', value: `${data.name} ${data.url}`}, {name: 'Commit', value: `${data.commit.message}`}]

        const payload = {embeds: [{description, color, image, thumbnail, fields, author}]};
        const response = await axios.post(process.env.WEBHOOK_BUILD_URL, payload);
        return response;
    }
  }
}

module.exports = BuildService;
