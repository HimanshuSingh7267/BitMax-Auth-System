const mongoose = require("mongoose");

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/mern_auth_db";

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;

    // Check if MONGO_URI is missing or contains Atlas placeholder
    if (!mongoURI || mongoURI.includes("<db_password>") || mongoURI.includes("<password>")) {
      console.warn(
        "\n⚠️  [Database Warning] MONGO_URI contains an unreplaced placeholder ('<db_password>') or is missing." +
        `\n👉 Falling back to local MongoDB: ${DEFAULT_LOCAL_URI}\n`
      );
      mongoURI = DEFAULT_LOCAL_URI;
    }

    const options = {
      serverSelectionTimeoutMS: 5000, // Fail fast if unreachable (5s instead of 30s)
      autoIndex: true,
    };

    const conn = await mongoose.connect(mongoURI, options);

    const host = conn.connection.host;
    const dbName = conn.connection.name;
    console.log(`✅ MongoDB connected successfully: ${host}/${dbName}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose runtime connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  Mongoose connection disconnected");
});

// Graceful process exit
const gracefulExit = async () => {
  try {
    await mongoose.connection.close();
    console.log("Mongoose connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error closing Mongoose connection:", err);
    process.exit(1);
  }
};

process.on("SIGINT", gracefulExit);
process.on("SIGTERM", gracefulExit);

module.exports = connectDB;
