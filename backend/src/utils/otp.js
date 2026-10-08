const crypto = require("crypto");

// Generate 6 digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

//Hash OTP before storing in database
const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports = {
  generateOTP,
  hashOTP,
};
