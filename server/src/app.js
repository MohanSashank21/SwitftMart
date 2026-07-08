const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require("./routes/authRoutes");
const {errorMiddleWare }= require("./middlewares/errorMiddleware");
// rest object
const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
console.log("app");
app.use("/api/v1/auth",authRoutes);

app.use(errorMiddleWare);

module.exports = app;