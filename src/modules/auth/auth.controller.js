const { registerSchema, loginSchema } = require("./auth.validation");
const { registerUser, loginUser } = require("./auth.service");
const express = require("express");

const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);

    return res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    return res.status(200).json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
