const axios = require("axios");

class AlertService {
  async create(data) {
    const content = `@here ${data.body}`;
    
    const response = await axios.post(process.env.WEBHOOK_ALERT_URL, { content });
    return response;
  }
}

module.exports = AlertService;
