const ReleaseService = require('../services/release');

class ReleaseController {
  constructor() {
    this.service = new ReleaseService();
  }

  async create(req, res) {
    try {
      const result = await this.service.create(req.body);
      
      if (result.error) {
        res.status(400).json({ error: result.error });
      } else {
        res.status(200).json({ message: 'Release note sent!' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'internal server error' });
    }
  }
}

module.exports = ReleaseController;
