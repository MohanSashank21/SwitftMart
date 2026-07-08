const mySqlPool = require("../config/db");

exports.create = async (connection, details) => {
  const [rows] = await connection.execute("insert into employees(name,email,password_hash,phone) values (?,?,?,?)", [details.name, details.email, details.password, details.phone]);
  return rows.insertId;
}

exports.updateRole = async (connection, role, employeeId) => {
  return await connection.execute("update employees set role = ? where id = ? ", [role, employeeId]);
}

exports.findByEmail = async (email) => {
  const [employee] = await mySqlPool.execute("select * from employees where email = ?", [email]);
  return employee[0];
}

exports.findById = async (id) =>{
  const [employees] = await mySqlPool.execute("select * from employees where id = ?",[id]);
  return employees[0];
}

exports.updatePassword = async(password,id) =>{
  await mySqlPool.execute("update employees set password_hash = ? where id = ?",[password,id]);
  return;
}

