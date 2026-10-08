const LoginHistory = require("../../database/models/LoginHistory");

const createLoginHistory = async ({ userId, loginMethod, status, req }) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req && req.headers) {
      ipAddress = req.headers["x-forwarded-for"] || null;

      userAgent = req.headers["user-agent"] || null;
    }

    if (!ipAddress && req && req.socket) {
      ipAddress = req.socket.remoteAddress || null;
    }

    await LoginHistory.create({
      user: userId,
      loginMethod: loginMethod,
      status: status,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });
  } catch (error) {
    console.error("Login history save failed:", error.message);
  }
};

const getLoginHistory = async (userId) => {
  return await LoginHistory.find({
    user: userId,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("loginMethod status ipAddress userAgent createdAt");
};

module.exports = {
  createLoginHistory,
  getLoginHistory,
};
