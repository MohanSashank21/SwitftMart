const authService = require("../services/authService.js")

exports.sendCustomerOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const response = await authService.sendCustomerOTP(phone);
    return res.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
}

exports.verifyCustomerOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const response = await authService.verifyCustomerOTP(phone, otp);
    const { refreshToken, ...result } = response;
    authService.setCookie(refreshToken, res);
    return res.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
}

exports.employeeRegistration = async (req, res, next) => {
  try {
    const { role } = req.user
    const response = await authService.employeeRegistration(req.body, role);
    return res.status(201).json(response);
  }
  catch (err) {
    next(err);
  }
}

exports.employeeLogin = async (req, res, next) => {
  try {
    const result = await authService.employeeLogin(req.body);
    authService.setCookie(result.refreshToken, res);
    res.status(200).json(result);
  }
  catch (err) {
    next(err);
  }
}

exports.refreshToken = async (req, res, next) => {
  try {
    const response = await authService.refreshToken(req, res);
    res.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
}

exports.logout = async (req, res, next) => {
  try {
    const response = await authService.logout(req);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict"
    });
    return res.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    const response = await authService.changePassword(req.user.id, req.body);
    res.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const response = await authService.forgotPassword(req.body.email);
    res.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const response = await authService.resetPassword(req.body);
    res.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
}