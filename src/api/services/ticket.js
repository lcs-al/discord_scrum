const axios = require('axios');

class TicketService {
  async create(data) {
    const link =  `https://vollsolutions.atlassian.net/browse/${data.key}`;
    const description = data.fields.description || '';

    const content = `@here Novo chamado: ${data.fields.summary} \n ${link} \n ${description}`;
    const response = await axios.post(process.env.WEBHOOK_URL, {content});
    return response;
  }
}

module.exports = TicketService;
