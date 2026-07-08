exports.assignStore = async (connection, employeeId, storeId) => {
  const employee_id = await connection.execute("insert into employee_store(employee_id,store_id) values(?,?)", [employeeId, storeId]);
  return;
}