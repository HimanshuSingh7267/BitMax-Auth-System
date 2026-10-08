const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./modules/auth/auth.routes");
const errorHandler = require("./middleware/error.middleware");
const { authenticate } = require("./middleware/auth.middleware");

const app = express();

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter - allows 100 requests per 15 minutes to prevent brute-force while allowing smooth UX
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Mount authentication routes
app.use("/api/auth", authLimiter, authRoutes);

// Protected user profile endpoint
app.get("/api/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected API accessed successfully",
    data: {
      user: req.user,
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
  });
});

// 404 Not Found route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler (MUST BE LAST)
app.use(errorHandler);

module.exports = app;
