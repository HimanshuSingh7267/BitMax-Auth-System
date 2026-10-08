const { verifyAccessToken } = require("../utils/jwt");
const User = require("../database/models/User");

const authenticate = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error("Authorization token is required");
    }

    // Expected format:
    // Bearer eyJhbGciOiJIUzI1Ni...
    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid authorization format");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new Error("Access token is required");
    }

    // Verify JWT
    const decoded = verifyAccessToken(token);

    // Find user
    const user = await User.findById(decoded.userId).select(
      "-password -otpHash -refreshToken",
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isVerified) {
      throw new Error("User account is not verified");
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

module.exports = {
  authenticate,
};
