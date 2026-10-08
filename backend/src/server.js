require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { verifyEmailTransporter } = require("./utils/email");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await verifyEmailTransporter();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
