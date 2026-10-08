const sendOTPSMS = async ({ phone, otp, purpose = "login" }) => {
  console.log("====================================");
  console.log("SMS OTP");
  console.log("Phone:", phone);
  console.log("Purpose:", purpose);
  console.log("OTP:", otp);
  console.log("Valid for: 5 minutes");
  console.log("====================================");

  // TODO:
  // Integrate SMS provider here in production.
  // Example providers:
  // Twilio, MSG91, AWS SNS, etc.

  return {
    success: true,
    message: "OTP generated successfully",
  };
};

module.exports = {
  sendOTPSMS,
};
