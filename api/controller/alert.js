const AlertService = require("../services/alert");

class Alert {
  constructor() {
    this.service = new AlertService();
  }

  create(req, res) {
    try {
      const body = req.body;
      this.service.create(body);

      res.status(200).json();
    } catch (err) {
      console.log(err);
      res.status(400).json();
    }
  }
}

module.exports = Alert;
