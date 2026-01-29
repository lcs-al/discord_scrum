const express = require('express');
const Release = require('../controller/release');
const router = express.Router();

const release = new Release();

router
  .route('/')
  .post((req, res) => release.create(req, res));

module.exports = router;
