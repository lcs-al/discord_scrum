const express = require('express');
const Comment = require('../controller/comment');
const router = express.Router();

const comment = new Comment();

router
  .route('/pullrequest')
  .post((req, res) => comment.create_pullrequest(req, res))

module.exports = router;
