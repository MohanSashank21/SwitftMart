require('dotenv').config();

const mySqlPool = require("./src/config/db");
const app = require("./src/app");

const port = process.env.PORT;

mySqlPool
.query('select 1')
.then(()=>{
  console.log("mysql connected");
app.listen(port ,()=>{
  console.log(`server is running at the port ${port}`);
}); })
.catch((err)=>{
  console.log("Error while setting up the connection with mysql: ",err);
})