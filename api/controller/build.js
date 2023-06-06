const BuildService = require("../services/build");

class Build {
  constructor() {
    this.service = new BuildService();
  }

  update_status(req, res) {
    try {
      const data = req.body.commit_status;

      this.service.create(data);
      
      res.status(200).json({ message: 'Build status created!' });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: 'bad request' });
    }
  }
}

module.exports = Build;
