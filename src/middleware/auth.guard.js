const jwt = require("jsonwebtoken");

const authGuard = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Access token is required");
      error.name = "AuthenticationError";
      throw error;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        const error = new Error("Access token has expired");
        error.name = "AuthenticationError";
        throw error;
      }
      
      const error = new Error("Invalid access token");
      error.name = "AuthenticationError";
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

module.exports = authGuard;
