const mySqlPool = require("../config/db");

exports.create = async (connection,body,id) =>{
  const rows = await connection.execute("insert into delivery_boy(employee_id,vehicle_no,latitude,longitude) values(?,?,?,?)",[id,body.vehicle_no]);
}

