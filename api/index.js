const express = require("express");
const cors = require('cors');
const router = require('./routes')
const dotenv = require('dotenv');
dotenv.config();

const corsOptions = {
  origin: process.env.ORIGIN,
  optionSuccessStatus: 200,
};

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json())
app.use(cors(corsOptions));

app.use(router);

const startServer = () => {
  app.listen(PORT, () => console.log(`Volleria listen on ${PORT}`));
}

module.exports = { startServer };
