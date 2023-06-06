const express = require('express');
const Build = require('../controller/build');
const router = express.Router();

const build = new Build();

router
  .route('/')
  .post((req, res) => build.update_status(req, res))

module.exports = router;