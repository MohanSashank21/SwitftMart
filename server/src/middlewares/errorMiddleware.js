exports.errorMiddleWare = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server Error" });
}
