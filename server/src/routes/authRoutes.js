const express = require('express');
const authController = require('../controllers/authController');
const authMiddleWare = require("../middlewares/authMiddleWare");
const router = express.Router();


router.post("/customer/send-otp", authController.sendCustomerOTP);
router.post("/customer/verify-otp", authController.verifyCustomerOTP);
router.post("/employee/register", authMiddleWare.authenticate, authController.employeeRegistration);
router.post("/employee/login", authController.employeeLogin);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authMiddleWare.authenticate, authController.logout);
router.patch("/employee/changepassword", authMiddleWare.authenticate, authController.changePassword);
router.post("/employee/forgotpassword", authController.forgotPassword);
router.patch("/employee/resetpassword", authController.resetPassword);


module.exports = router