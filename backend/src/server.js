require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { verifyEmailTransporter } = require("./utils/email");

const startServer = async () => {
  try {
    await connectDB();

    await verifyEmailTransporter();

    console.log("Backend initialized successfully");
  } catch (error) {
    console.error("Server startup failed:", error.message);
    throw error;
  }
};

startServer();

module.exports = app;
