const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;

  if (
    err.message.includes("required") ||
    err.message.includes("Invalid") ||
    err.message.includes("already") ||
    err.message.includes("expired") ||
    err.message.includes("not found") ||
    err.message.includes("Maximum")
  ) {
    statusCode = 400;
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
