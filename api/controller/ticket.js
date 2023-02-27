const TicketService = require("../services/ticket");

class Ticket {
  constructor() {
    this.service = new TicketService();
  }

  create(req, res) {
    try {
      const {key, fields} = req.body.issue;

      this.service.create({ key, fields });
      
      res.status(200).json({ message: 'Ticket created!' });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: 'bad request' });
    }
  }
}

module.exports = Ticket;
