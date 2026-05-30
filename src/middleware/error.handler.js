const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      code: "VALIDATION_ERROR",
      message: err.issues[0].message,
    });
  }

  // Prisma Unique Constraint Violation (P2002)
  if (err.code === "P2002") {
    return res.status(400).json({
      status: 400,
      code: "CONFLICT_ERROR",
      message: "Email address already registered",
    });
  }

  // Custom Validation Error (like non-existent organization)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: 400,
      code: "VALIDATION_ERROR",
      message: err.message,
    });
  }

  // Custom Authentication Failure
  if (err.name === "AuthenticationError") {
    return res.status(401).json({
      status: 401,
      code: "UNAUTHORIZED_ERROR",
      message: err.message,
    });
  }

  // Unhandled Runtime Exception
  return res.status(500).json({
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected error occurred",
  });
};

module.exports = errorHandler;
