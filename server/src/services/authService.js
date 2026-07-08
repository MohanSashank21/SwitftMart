const otpService = require("./otpService");
const customerModel = require("../models/customer");
const employeeModel = require("../models/employee");
const employeeStoreModel = require("../models/employee_store");
const deliveryBoyModel = require("../models/delivery_boy");
const jwt = require("../utils/jwt");
const APIError = require("../utils/APIError");
const bcrypt = require("bcrypt");
const refreshTokenModel = require("../models/refresh_tokens");
const crypto = require("crypto");
const mySqlPool = require("../config/db");

const issueToken = async (id, role) => {
  const accessToken = jwt.createAccessToken({ id: id, role: role });
  const refreshToken = jwt.createRefreshToken({ id: id });
  const hash_refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const user = await refreshTokenModel.findByUserId(id);
  if (!user) {
    await refreshTokenModel.create(id, hash_refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  }
  else
    await refreshTokenModel.updateToken(hash_refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), id);
  return { accessToken: accessToken, refreshToken: refreshToken };
}

exports.setCookie = (refreshToken, res) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return { success: true }
}

exports.sendCustomerOTP = async (phone) => {
  return await otpService.sendOTP(phone);
}

exports.verifyCustomerOTP = async (phone, otp) => {
  const response = await otpService.verifyOTP(phone, otp);
  let customer = await customerModel.findByPhone(phone);
  if (!customer) {
    const id = await customerModel.create(phone);
    customer = await customerModel.findById(id);
  }
  const { accessToken, refreshToken } = await issueToken(customer.id, "customer");
  return { success: true, message: "customer login Successful", accessToken, refreshToken, customer };
}

// implementing the transaction when multiple model are correlated
exports.employeeRegistration = async (details, role) => {
  let connection = await mySqlPool.getConnection();
  try {
    await connection.beginTransaction();
    const hashedPassword = await bcrypt.hash(details.password, 10);
    details.password = hashedPassword;
    const employeeId = await employeeModel.create(connection, details);
    await employeeStoreModel.assignStore(connection, employeeId, details.store_id);
    let employeeRole = "";
    if (role === "admin") {
      employeeRole = "store_manager";
    }
    else if (role === "store_manager") {
      employeeRole = "delivery_boy";
    }
    else {
      employeeRole = "admin";
    }
    await employeeModel.updateRole(connection, employeeRole, employeeId);
    if (role === "store_manager") {
      await deliveryBoyModel.create(connection, details, employeeId);
    }
    await connection.commit();
    return { success: true, message: "employee successfully registered" };
  }
  catch (err) {
    await connection.rollback();
    throw err;
  }
  finally {
    connection.release();
  }
}

exports.employeeLogin = async (details) => {
  const employee = await employeeModel.findByEmail(details.email);
  if (!employee) {
    throw new APIError(401, "Invalid email");
  }
  const passwordMatch = await bcrypt.compare(details.password, employee.password_hash);
  if (!passwordMatch) {
    throw new APIError(401, "email or password Invalid");
  }
  const tokens = await issueToken(employee.id, employee.role);
  delete employee.password_hash;
  return { success: true, message: "employee login Successful", accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

exports.refreshToken = async (req, res) => {
  const rToken = req.cookies.refreshToken;
  if (!rToken) {
    throw new APIError(401, "refreshToken is not available");
  }
  jwt.verifyRefreshToken(rToken);
  const hashToken = crypto.createHash("sha256").update(rToken).digest("hex");
  const user = await refreshTokenModel.find(hashToken);
  if (!user) {
    throw new APIError(401, "Invalid Token");
  }
  const employee = await employeeModel.findById(user.user_id);
  if (!employee) {
    res.status(404).json({ message: "user not found" });
  }
  const accessToken = jwt.createAccessToken({ id: user.user_id, role: employee.role });
  return { accessToken };
}

exports.logout = async (req) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new APIError(404, "refreshToken not found");
  }
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const user = await refreshTokenModel.find(refreshTokenHash);
  await refreshTokenModel.delete(user.user_id);
  return { success: true, message: "logout successfully" };
}

exports.changePassword = async (id, body) => {
  const employee = await employeeModel.findById(id);
  if (!employee) {
    throw new APIError(404, "Employee not found");
  }
  if (!employee.password_hash) {
    throw new APIError(500, "Stored password hash is missing");
  }

  const { oldPassword, newPassword, confirmNewPassword } = body;
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    throw new APIError(400, "oldPassword, newPassword, and confirmNewPassword are required");
  }

  const passwordMatch = await bcrypt.compare(oldPassword, employee.password_hash);
  if (!passwordMatch) {
    throw new APIError(401, "current password is incorrect");
  }
  if (newPassword !== confirmNewPassword) {
    throw new APIError(401, "Both NewPassword and confirmNewPassword should be same");
  }
  const password_hash = await bcrypt.hash(newPassword, 10);
  await employeeModel.updatePassword(password_hash, id);
  return { success: true, message: "password successfully changed" };
}

exports.forgotPassword = async (email) => {
  const user = await employeeModel.findByEmail(email);
  if (!user) {
    throw new APIError("404", "user not found enter the correct email");
  }
  await otpService.sendOTP(user.phone);
  return { message: "otp is sent successfully" }
}

exports.resetPassword = async (body) => {
  const { newPassword, confirmNewPassword } = body;
  if (!newPassword) {
    throw new APIError(404, "Enter the new Password");
  }
  if (!confirmNewPassword) {
    throw new APIError(404, "Please confirm your password");
  }
  if (newPassword !== confirmNewPassword) {
    throw new APIError(400, "validate the new password properly");
  }
  const employee = await employeeModel.findByEmail(body.email);
  if (!employee) {
    throw new APIError(404, "employee not found");
  }
  await employeeModel.updatePassword(newPassword, employee.id);
  return { message: "successfully reset the password" }
}