const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: messages.join(", ") });
  }
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, error: "Invalid booking ID" });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, error: "Duplicate record" });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
