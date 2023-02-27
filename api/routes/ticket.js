const express = require('express');
const Ticket = require('../controller/ticket');
const router = express.Router();

const ticket = new Ticket();

router
  .route('/')
  .post((req, res) => ticket.create(req, res))

module.exports = router;