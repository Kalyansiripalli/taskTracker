const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const organizationRoutes = require("./modules/organizations/organizations.routes");
const authGuard = require("./middleware/auth.guard");
const errorHandler = require("./middleware/error.handler");

const { swaggerUi, swaggerDocs } = require("./config/swagger");

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount Swagger UI documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount authentication routes (public)
app.use("/api/v1/auth", authRoutes);

// Authentication guard — all routes below require a valid access token
app.use(authGuard);

// Mount organization routes (protected)
app.use("/api/v1/organizations", organizationRoutes);

// Centralized error handler (must be registered last)
app.use(errorHandler);

module.exports = app;
