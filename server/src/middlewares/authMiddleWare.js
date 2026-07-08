const { verifyAccessToken } = require("../utils/jwt");
const APIError = require("../utils/APIError");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new APIError(401, "authorisation header is missing");
  }
  if (!authHeader.startsWith("Bearer ")) {
    throw new APIError(401, "Invalid authorisation header");
  }
  return authHeader.split(" ")[1];
}

exports.authenticate = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id.id,
      role: payload.id.role
    }
    next();
  }
  catch (err) {
    next(err);
  }
}