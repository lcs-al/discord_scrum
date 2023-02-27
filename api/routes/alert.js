const express = require("express");
const Alert = require("../controller/alert");
const router = express.Router();

const alert = new Alert();

router.route("/").post((req, res) => alert.create(req, res));

module.exports = router;
