const jwt = require('jsonwebtoken');

exports.createAccessToken = (id,role) =>{
  const payload = {id,role}
  return jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
}

exports.createRefreshToken = (id,role) =>{
  const payload = {id,role}
  return jwt.sign(payload,process.env.JWT_REFRESH_TOKEN,{expiresIn:REFRESH_TOKEN_EXPIRY});
}

exports.verifyAccessToken = (token) =>{
  return jwt.verify(token,JWT_ACCESS_SECRET);
}

exports.verifyRefreshToken = (token) =>{
  return jwt.verify(token,JWT_REFRESH_TOKEN);
}
