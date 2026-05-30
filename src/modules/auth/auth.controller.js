const { registerSchema, loginSchema, refreshSchema, logoutSchema } = require("./auth.validation");
const { registerUser, loginUser, refreshUserTokens, logoutUser } = require("./auth.service");

const register = async (req, res, next) => {
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
};

const login = async (req, res, next) => {
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
};

const refresh = async (req, res, next) => {
  try {
    const data = refreshSchema.parse(req.body);
    const result = await refreshUserTokens(data);

    return res.status(200).json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const data = logoutSchema.parse(req.body);
    const result = await logoutUser(data);

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
