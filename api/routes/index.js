const express = require('express');
const router = express.Router();
const ticket = require('./ticket');
const comment = require('./comment');
const alert = require('./alert');

router.use('/ticket', ticket);
router.use('/comment', comment);
router.use('/alert', alert);

module.exports = router;