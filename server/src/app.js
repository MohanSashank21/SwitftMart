const express = require('express');

// rest object
const app = express();

//middlewares
app.use(express.json());

module.exports = app;