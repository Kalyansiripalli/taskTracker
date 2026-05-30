const { OpenAPIRegistry, OpenApiGeneratorV3 } = require("@asteasolutions/zod-to-openapi");
const swaggerUi = require("swagger-ui-express");
const { z } = require("zod");
const { registerSchema, loginSchema } = require("../modules/auth/auth.validation");

const registry = new OpenAPIRegistry();

// Register request body schemas
const RegisterBody = registry.register("RegisterInput", registerSchema);
const LoginBody = registry.register("LoginInput", loginSchema);

// Register response schemas
const ErrorResponse = registry.register("ErrorResponse", z.object({
  status: z.number().openapi({ example: 400 }),
  code: z.string().openapi({ example: "VALIDATION_ERROR" }),
  message: z.string().openapi({ example: "Explicit contextual message detailing why the request failed." }),
}));

const RegisterSuccessResponse = registry.register("RegisterSuccessResponse", z.object({
  message: z.string().openapi({ example: "User registered successfully" }),
  userId: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
}));

const LoginSuccessResponse = registry.register("LoginSuccessResponse", z.object({
  access_token: z.string().openapi({ example: "signed-jwt-access-token" }),
  refresh_token: z.string().openapi({ example: "" }),
}));

// POST /auth/register Path definition
registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register",
  summary: "User Registration",
  description: "Registers a new user inside an organization. Performs strong password validation and organization existence verification.",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterBody,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: RegisterSuccessResponse,
        },
      },
    },
    400: {
      description: "Validation error or Conflict error",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// POST /auth/login Path definition
registry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  summary: "User Login",
  description: "Authenticates user credentials and returns a signed JWT token.",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginBody,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful authentication",
      content: {
        "application/json": {
          schema: LoginSuccessResponse,
        },
      },
    },
    401: {
      description: "Unauthorized credentials",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
  },
});

function getSwaggerDocs() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Task Tracker Service API Specification",
      version: "1.0.0",
      description: "Sprint A: Global Infrastructure & Authentication API Docs",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
  });
}

const swaggerDocs = getSwaggerDocs();

module.exports = {
  swaggerUi,
  swaggerDocs,
};
