const express = require('express');
const router = express.Router();
const ticket = require('./ticket');
const comment = require('./comment');
const alert = require('./alert');
const build = require('./build');

router.use('/ticket', ticket);
router.use('/comment', comment);
router.use('/alert', alert);
router.use('/build_status', build);

module.exports = router;