const mySqlPool = require("../config/db");

exports.create = async (employeeId,token,expiryDate) =>{

const [rows] = await mySqlPool.execute("insert into refresh_tokens(user_id,token_hash,expires_at) values(?,?,?)",[employeeId,token,expiryDate]);
return;
}


exports.find = async (refreshToken)=>{
  const [user] = await mySqlPool.execute("select * from refresh_tokens where token_hash = ?",[refreshToken]);
  return user[0];
} 

exports.findByUserId = async (id)=>{
  const [user] = await mySqlPool.execute("select * from refresh_tokens where user_id = ?",[id]);
  return user[0];
} 



exports.updateToken = async (refreshToken,date,id) =>{
  await mySqlPool.execute("update  refresh_tokens set token_hash = ?, expires_at = ? where user_id = ?",[refreshToken,date,id]);
  return;
}

exports.delete = async (id) =>{
  await mySqlPool.execute("delete from refresh_tokens where user_id = ?",[id]);
  return
}

