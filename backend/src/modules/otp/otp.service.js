const { generateOTP, hashOTP } = require("../../utils/otp");
const { sendOTPEmail } = require("../../utils/email");
const { sendOTPSMS } = require("../../utils/sms");

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN = 60 * 1000;

// ==========================================
// CREATE AND SEND OTP
// ==========================================

const createAndSaveOTP = async (user, purpose, deliveryMethod = "email") => {
  if (!["registration", "login", "forgot-password"].includes(purpose)) {
    throw new Error("Invalid OTP purpose");
  }

  if (!["email", "phone"].includes(deliveryMethod)) {
    throw new Error("Invalid OTP delivery method");
  }

  // OTP resend cooldown
  if (user.lastOtpSentAt) {
    const timePassed = Date.now() - new Date(user.lastOtpSentAt).getTime();

    const OTP_RESEND_COOLDOWN = 60 * 1000;

    if (timePassed < OTP_RESEND_COOLDOWN) {
      const remainingSeconds = Math.ceil(
        (OTP_RESEND_COOLDOWN - timePassed) / 1000,
      );

      throw new Error(
        `Please wait ${remainingSeconds} seconds before requesting another OTP`,
      );
    }
  }

  // Generate OTP
  const otp = generateOTP();

  // Hash OTP before storing
  const otpHash = hashOTP(otp);

  user.otpHash = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  user.otpPurpose = purpose;
  user.otpAttempts = 0;
  user.lastOtpSentAt = new Date();

  await user.save();

  try {
    if (deliveryMethod === "email") {
      await sendOTPEmail({
        email: user.email,
        otp,
        purpose,
      });

      console.log("OTP email sent successfully");
    }

    if (deliveryMethod === "phone") {
      await sendOTPSMS({
        phone: user.phone,
        otp,
        purpose,
      });

      console.log("OTP SMS sent successfully");
    }
  } catch (error) {
    console.error("OTP delivery failed:", error);

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = undefined;
    user.otpAttempts = 0;
    user.lastOtpSentAt = undefined;

    await user.save();

    throw new Error("Unable to send OTP");
  }

  return {
    expiresIn: 5 * 60,
    deliveryMethod,
  };
};

// ==========================================
// VERIFY OTP
// ==========================================

const verifyOTP = async (user, otp, expectedPurpose) => {
  if (!user.otpHash) {
    throw new Error("OTP not found");
  }

  // Check expiry
  if (!user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
    throw new Error("OTP has expired");
  }

  // Check OTP purpose
  if (user.otpPurpose !== expectedPurpose) {
    throw new Error("Invalid OTP purpose");
  }

  // Check maximum attempts
  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("Maximum OTP attempts exceeded");
  }

  // Hash entered OTP
  const hashedOTP = hashOTP(otp);

  // Compare hashes
  if (hashedOTP !== user.otpHash) {
    user.otpAttempts += 1;

    await user.save();

    throw new Error("Invalid OTP");
  }

  return true;
};

// ==========================================
// CLEAR OTP
// ==========================================

const clearOTP = (user) => {
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  user.lastOtpSentAt = undefined;
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createAndSaveOTP,
  verifyOTP,
  clearOTP,
};
