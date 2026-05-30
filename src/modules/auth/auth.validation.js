const { z } = require("zod");
const { extendZodWithOpenApi } = require("@asteasolutions/zod-to-openapi");

extendZodWithOpenApi(z);

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),

  organization_id: z.string().uuid("Invalid organization ID format"),

  role: z.enum(["ADMIN", "MANAGER", "MEMBER"], {
    error: () => ({
      message: "Invalid role specified",
    }),
  }),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),

  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

module.exports = { registerSchema, loginSchema, refreshSchema, logoutSchema };
