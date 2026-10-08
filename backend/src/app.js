const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./modules/auth/auth.routes");
const errorHandler = require("./middleware/error.middleware");
const { authenticate } = require("./middleware/auth.middleware");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");

const app = express();

// Security
app.use(helmet());

app.use(
  cors({
    origin: "*",
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(mongoSanitize());
// app.use(xss());

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
  });
});

// Error handler
app.use(errorHandler);

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "Protected API accessed successfully",
    data: {
      user: req.user,
    },
  });
});

module.exports = app;
