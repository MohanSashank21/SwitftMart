require('dotenv').config();

const mySqlPool = require("./src/config/db");
const app = require("./src/app");
const { connectRedis } = require("./src/config/redis");
const port = process.env.PORT;


const startServer = async () =>{
  try {
    await connectRedis();
    console.log("redis connected");

    await mySqlPool.query('select 1');
    console.log("mysql is connected");

    app.listen(port ,()=>{
      console.log(`server is running at the port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

