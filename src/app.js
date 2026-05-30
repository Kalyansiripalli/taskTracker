const express = require("express");
const authRoutes = require("./modules/auth/auth.controller");
const errorHandler = require("./middleware/error.handler");

const { swaggerUi, swaggerDocs } = require("./config/swagger");

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount Swagger UI documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount authentication routes
app.use("/api/v1/auth", authRoutes);

// Centralized error handler (must be registered last)
app.use(errorHandler);

module.exports = app;
