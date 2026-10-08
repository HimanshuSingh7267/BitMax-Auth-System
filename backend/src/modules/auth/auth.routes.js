const express = require("express");

const {
  register,
  verifyOTP,
  setUserPassword,
  loginPassword,
  loginOTP,
  verifyLoginOTP,
  resendOTP,
  forgotPasswordController,
  resetPasswordController,
  refreshTokenController,
  logoutController,
} = require("./auth.controller");

const { authenticate } = require("../../middleware/auth.middleware");
const { getLoginHistoryController } = require("./auth.controller");
const router = express.Router();

/* ==========================================
   REGISTRATION
========================================== */

router.post("/register", register);

/* ==========================================
   VERIFY REGISTRATION OTP
========================================== */

router.post("/verify-otp", verifyOTP);

/* ==========================================
   SET PASSWORD
========================================== */

router.post("/set-password", setUserPassword);

/* ==========================================
   LOGIN WITH PASSWORD
========================================== */

router.post("/login-password", loginPassword);

/* ==========================================
   LOGIN WITH OTP
========================================== */

router.post("/login-otp", loginOTP);

/* ==========================================
   VERIFY LOGIN OTP
========================================== */

router.post("/verify-login-otp", verifyLoginOTP);

/* ==========================================
   RESEND OTP
========================================== */

router.post("/resend-otp", resendOTP);

//Forgot Password and reset
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/refresh-token", refreshTokenController);

router.post("/logout", authenticate, logoutController);

router.get("/login-history", authenticate, getLoginHistoryController);
module.exports = router;
