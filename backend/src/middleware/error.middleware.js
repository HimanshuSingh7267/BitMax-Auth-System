const errorHandler = (err, req, res, next) => {
  // Log error for debugging on the server
  console.error("Error handler caught:", err);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle Mongoose duplicate key error (e.g., duplicate email or phone)
  else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for ${err.path}`;
  }

  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
  }

  // Fallback status mapping for common authentication and validation errors
  else if (statusCode === 500) {
    const msg = (message || "").toLowerCase();

    if (
      msg.includes("required") ||
      msg.includes("invalid") ||
      msg.includes("already") ||
      msg.includes("expired") ||
      msg.includes("not found") ||
      msg.includes("maximum") ||
      msg.includes("set your password") ||
      msg.includes("passwords do not match") ||
      msg.includes("must be at least")
    ) {
      statusCode = 400;
    } else if (
      msg.includes("verify your account") ||
      msg.includes("locked")
    ) {
      statusCode = 403;
    } else if (
      msg.includes("unauthorized") ||
      msg.includes("credentials") ||
      msg.includes("access token") ||
      msg.includes("refresh token")
    ) {
      statusCode = 401;
    }
  }

  // Always return a clean, structured JSON payload
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
