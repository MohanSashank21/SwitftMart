class APIError extends Error {
  constructor(statusCode = 500, message = "Internal server Error") {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);

  }
}

module.exports = APIError;