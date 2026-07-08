const mySqlPool = require("../config/db");

exports.findById  = async (id) =>{
  const [rows] = await mySqlPool.execute( "select * from customers where id = ?",[id]);
  return rows[0];
}

exports.findByPhone = async (phone) =>{
 const [rows] = await mySqlPool.execute("select * from customers where phone = ?",[phone]);
 return rows[0];
}

exports.create = async (phone) =>{
 const [customer] = await mySqlPool.execute("insert into customers(phone) values(?)",[phone]);
 return customer.insertId;
}