const CommentService = require("../services/comment.js");

class Comment {
  constructor() {
    this.service = new CommentService();
  }

  async create_pullrequest(req, res) {
    try {
      const content = await this.service.create_pullrequest(req.body);
      
      res.status(200).json({ content, message: 'Comment created!' });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: 'bad request' });
    }
  }
}

module.exports = Comment;
