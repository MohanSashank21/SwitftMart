const {createClient} = require('redis');
const redisClient = createClient({url:"redis://127.0.0.1:6379"});
redisClient.on("error",(err)=>{console.log("redis error: ",err)});
const connectRedis = () =>{
  if(!redisClient.isOpen){
    return redisClient.connect();
  }
};

exports.redisClient = redisClient;
exports.connectRedis = connectRedis;
