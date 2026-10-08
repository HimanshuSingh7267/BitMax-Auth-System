const validator = require("validator");
const User = require("../../database/models/User");

const { createAndSaveOTP, verifyOTP, clearOTP } = require("../otp/otp.service");

const { hashPassword, comparePassword } = require("../../utils/password");
const { createLoginHistory } = require("./loginHistory.service");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

// REGISTER
const registerUser = async ({ name, email, phone }) => {
  name = String(name || "").trim();
  email = String(email || "")
    .trim()
    .toLowerCase();
  phone = String(phone || "").trim();
  //Required fields
  if (!name || !email || !phone) {
    throw new Error("Name, email and phone are required");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Invalid Indian mobile number");
  }

  if (await User.findOne({ email })) {
    throw new Error("Email already registered");
  }

  if (await User.findOne({ phone })) {
    throw new Error("Phone already registered");
  }

  const user = await User.create({
    name,
    email,
    phone,
    isVerified: false,
  });

  await createAndSaveOTP(user, "registration");

  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
};

// VERIFY REGISTRATION OTP
const verifyRegistrationOTP = async ({ email, otp }) => {
  email = String(email || "")
    .trim()
    .toLowerCase();

  otp = String(otp || "").trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    throw new Error("Valid email and 6-digit OTP are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  // Verify OTP
  await verifyOTP(user, otp, "registration");

  // Mark account as verified
  user.isVerified = true;

  // Clear OTP data
  clearOTP(user);

  // Save changes to MongoDB
  await user.save();

  return {
    userId: user._id,
    email: user.email,
    isVerified: true,
  };
};
// SET PASSWORD
const setPassword = async ({ userId, password }) => {
  userId = String(userId || "").trim();
  password = String(password || "");

  if (!userId || !password) {
    throw new Error("User ID and password are required");
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!strongPassword.test(password)) {
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
    );
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.isVerified) throw new Error("Please verify your account first");

  user.password = await hashPassword(password);
  await user.save();

  return { userId: user._id, message: "Password set successfully" };
};

// LOGIN WITH PASSWORD
const loginWithPassword = async ({ email, password }) => {
  email = String(email || "")
    .trim()
    .toLowerCase();
  password = String(password || "");

  if (!validator.isEmail(email) || !password) {
    throw new Error("Valid email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");
  if (!user.isVerified) throw new Error("Please verify your account first");

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Account is temporarily locked");
  }

  if (!user.password) throw new Error("Please set your password first");

  const valid = await comparePassword(password, user.password);

  if (!valid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.failedLoginAttempts = 0;
    }

    await user.save();
    throw new Error("Invalid email or password");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  };
};

// LOGIN WITH OTP
const loginWithOTP = async ({ email, phone }) => {
  email = String(email || "")
    .trim()
    .toLowerCase();

  phone = String(phone || "").trim();

  if (!email && !phone) {
    throw new Error("Email or phone is required");
  }

  // Email validation
  if (email && !validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  // Phone validation
  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Invalid Indian mobile number");
  }

  // Don't allow both
  if (email && phone) {
    throw new Error("Provide either email or phone");
  }

  const user = email
    ? await User.findOne({ email })
    : await User.findOne({ phone });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your account first");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Account is temporarily locked");
  }

  const deliveryMethod = email ? "email" : "phone";

  await createAndSaveOTP(user, "login", deliveryMethod);

  return {
    userId: user._id,
    deliveryMethod,
    message:
      deliveryMethod === "email"
        ? "Login OTP sent successfully to your email"
        : "Login OTP sent successfully to your phone",
  };
};

// FORGOT PASSWORD
const forgotPassword = async ({ email }) => {
  email = String(email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("Email is required");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your account first");
  }

  await createAndSaveOTP(user, "forgot-password");

  return {
    userId: user._id,
    email: user.email,
    message: "Password reset OTP sent successfully to your email",
  };
};

// VERIFY LOGIN OTP
const verifyLoginOTP = async ({ email, phone, otp }) => {
  email = String(email || "")
    .trim()
    .toLowerCase();
  phone = String(phone || "").trim();
  otp = String(otp || "").trim();

  if (!email && !phone) throw new Error("Email or phone is required");
  if (!/^\d{6}$/.test(otp)) throw new Error("Valid 6-digit OTP is required");
  if (email && !validator.isEmail(email)) throw new Error("Invalid email");

  const user = email
    ? await User.findOne({ email })
    : await User.findOne({ phone });

  if (!user) throw new Error("User not found");
  if (!user.isVerified) throw new Error("Please verify your account first");

  const valid = await verifyOTP(user, otp, "login");
  if (!valid) throw new Error("Invalid or expired OTP");

  clearOTP(user);

  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;

  await user.save();

  return {
    message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  };
};

// RESEND LOGIN OTP
const resendOTP = async ({ email }) => {
  email = String(email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  await createAndSaveOTP(user, "registration");

  return {
    message: "OTP resent successfully",
  };
};

// RESET PASSWORD
const resetPassword = async ({ email, otp, newPassword }) => {
  email = String(email || "")
    .trim()
    .toLowerCase();

  otp = String(otp || "").trim();
  newPassword = String(newPassword || "");

  if (!email || !otp || !newPassword) {
    throw new Error("Email, OTP and new password are required");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new Error("Valid 6-digit OTP is required");
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!strongPassword.test(newPassword)) {
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your account first");
  }

  // Verify reset OTP
  await verifyOTP(user, otp, "forgot-password");

  // Set new password
  user.password = await hashPassword(newPassword);

  // Invalidate existing refresh token
  user.refreshToken = null;

  // Clear OTP data
  clearOTP(user);

  // Save everything once
  await user.save();

  return {
    userId: user._id,
    email: user.email,
    message: "Password reset successfully",
  };
};

// REFRESH TOKEN
const refreshAccessToken = async ({ refreshToken }) => {
  refreshToken = String(refreshToken || "").trim();

  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your account first");
  }

  // Check whether this refresh token belongs to the current session
  if (!user.refreshToken || user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Rotate refresh token
  user.refreshToken = newRefreshToken;

  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// LOGOUT
const logoutUser = async (userId) => {
  userId = String(userId || "").trim();

  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Invalidate refresh token
  user.refreshToken = null;

  await user.save();

  return {
    message: "Logout successful",
  };
};

// EXPORT ALL SEVEN SERVICES
module.exports = {
  registerUser,
  verifyRegistrationOTP,
  setPassword,
  loginWithPassword,
  loginWithOTP,
  verifyLoginOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
};
