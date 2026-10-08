const {
  registerUser,
  verifyRegistrationOTP,
  setPassword,
  loginWithPassword,
  loginWithOTP,
  verifyLoginOTP: verifyLoginOTPService,
  resendOTP: resendOTPService,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
} = require("./auth.service");

const { successResponse } = require("../../utils/response");
const { getLoginHistory } = require("./loginHistory.service");
/* ==========================================
   REGISTER
========================================== */

const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    return successResponse(
      res,
      201,
      "Registration successful. OTP sent for verification.",
      result,
    );
  } catch (error) {
    next(error);
  }
};

/* ==========================================
   VERIFY REGISTRATION OTP
========================================== */

const verifyOTP = async (req, res, next) => {
  try {
    const result = await verifyRegistrationOTP(req.body);

    return successResponse(res, 200, "OTP verified successfully.", result);
  } catch (error) {
    next(error);
  }
};

/* ==========================================
   SET PASSWORD
========================================== */

const setUserPassword = async (req, res, next) => {
  try {
    const result = await setPassword(req.body);

    return successResponse(res, 200, "Password set successfully.", result);
  } catch (error) {
    next(error);
  }
};

/* ==========================================
   LOGIN WITH PASSWORD
========================================== */

const loginPassword = async (req, res, next) => {
  try {
    const result = await loginWithPassword(req.body);

    return successResponse(res, 200, "Login successful.", result);
  } catch (error) {
    next(error);
  }
};

/* ==========================================
   LOGIN WITH OTP
========================================== */

const loginOTP = async (req, res, next) => {
  try {
    const result = await loginWithOTP(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================
   VERIFY LOGIN OTP
========================================== */

const verifyLoginOTP = async (req, res, next) => {
  try {
    const result = await verifyLoginOTPService(req.body);

    return successResponse(res, 200, result.message, result);
  } catch (error) {
    console.log("verification failed", error);
    next(error);
  }
};

/* ==========================================
   RESEND OTP
========================================== */

const resendOTP = async (req, res, next) => {
  try {
    const result = await resendOTPService(req.body);

    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};
//Forgot Password Controller
const forgotPasswordController = async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body);

    return successResponse(
      res,
      200,
      "Password reset OTP sent successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

//Reset Password Controller

const resetPasswordController = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);

    return successResponse(res, 200, "Password reset successfully", result);
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN CONTROLLER
const refreshTokenController = async (req, res, next) => {
  try {
    const result = await refreshAccessToken(req.body);

    return successResponse(
      res,
      200,
      "Access token refreshed successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

// LOGOUT CONTROLLER
const logoutController = async (req, res, next) => {
  try {
    const result = await logoutUser(req.user._id);

    return successResponse(res, 200, "Logout successful", result);
  } catch (error) {
    next(error);
  }
};

const getLoginHistoryController = async (req, res, next) => {
  try {
    const history = await getLoginHistory(req.user.userId);

    res.json({
      success: true,
      message: "Login history fetched successfully",
      data: {
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================
   EXPORT ALL CONTROLLERS
========================================== */

module.exports = {
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
  getLoginHistoryController,
};
