const { redisClient } = require("../config/redis");

exports.set = async (key, value) => {
  return await redisClient.set(key, value);
};

exports.get = async (key) => {
  return await redisClient.get(key);
};

exports.del = async (key) => {
  return await redisClient.del(key);
};

exports.setWithExpiry = async (key, value, seconds) => {
  return await redisClient.set(key, value, { EX: seconds });
};

exports.exists = async (key) => {
  console.log(key);
  return (await redisClient.exists(key)) === 1;

};

exports.increment = async (key) => {
  return await redisClient.incr(key);
};
exports.expire = async (key, seconds) => {
  return await redisClient.expire(key, seconds);
}

