const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getPrismaClient = require("../../config/db");

const getJwtSecret = () => process.env.JWT_SECRET;
const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const registerUser = async ({ organization_name, email, password }) => {
  const prisma = await getPrismaClient();

  // Check for duplicate organization name (case-insensitive)
  const duplicate = await prisma.organization.findFirst({
    where: { name: { equals: organization_name, mode: "insensitive" } },
  });

  if (duplicate) {
    const error = new Error("Organization with this name already exists");
    error.name = "ConflictError";
    throw error;
  }

  // Create the organization
  const org = await prisma.organization.create({
    data: { name: organization_name },
  });

  // Hash password and create admin user
  const password_hash = await bcryptjs.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      organization_id: org.id,
      role: "ADMIN",
    },
  });

  return { organization: org, user };
};

const loginUser = async ({ email, password }) => {
  const prisma = await getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.name = "AuthenticationError";
    throw error;
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.name = "AuthenticationError";
    throw error;
  }

  // Generate access token (1 hour)
  const access_token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    },
    getJwtSecret(),
    { expiresIn: "1h" }
  );

  // Generate refresh token (7 days)
  const refresh_token = jwt.sign(
    {
      userId: user.id,
      type: "refresh",
    },
    getJwtRefreshSecret(),
    { expiresIn: "7d" }
  );

  // Persist refresh token in the database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      user_id: user.id,
      token: refresh_token,
      expires_at: expiresAt,
    },
  });

  return { access_token, refresh_token };
};

const refreshUserTokens = async ({ refresh_token }) => {
  const prisma = await getPrismaClient();

  // Verify JWT signature
  let decoded;
  try {
    decoded = jwt.verify(refresh_token, getJwtRefreshSecret());
  } catch (err) {
    const error = new Error("Invalid refresh token");
    error.name = "AuthenticationError";
    throw error;
  }

  // Look up the token in the database
  const dbToken = await prisma.refreshToken.findUnique({
    where: { token: refresh_token },
  });

  // Check 1: Token not found
  if (!dbToken) {
    const error = new Error("Invalid refresh token");
    error.name = "AuthenticationError";
    throw error;
  }

  // Check 2: Token is revoked — Breach Detection
  if (dbToken.is_revoked) {
    // Revoke ALL refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { user_id: dbToken.user_id },
      data: { is_revoked: true },
    });

    const error = new Error("Invalid refresh token");
    error.name = "AuthenticationError";
    throw error;
  }

  // Check 3: Token is expired
  if (dbToken.expires_at < new Date()) {
    const error = new Error("Refresh token expired");
    error.name = "AuthenticationError";
    throw error;
  }

  // Fetch the user to build the new access token payload
  const user = await prisma.user.findUnique({
    where: { id: dbToken.user_id },
  });

  if (!user) {
    const error = new Error("Invalid refresh token");
    error.name = "AuthenticationError";
    throw error;
  }

  // Rotation: Revoke the old refresh token
  await prisma.refreshToken.update({
    where: { id: dbToken.id },
    data: { is_revoked: true },
  });

  // Generate new access token (1 hour)
  const new_access_token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    },
    getJwtSecret(),
    { expiresIn: "1h" }
  );

  // Generate new refresh token (7 days)
  const new_refresh_token = jwt.sign(
    {
      userId: user.id,
      type: "refresh",
    },
    getJwtRefreshSecret(),
    { expiresIn: "7d" }
  );

  // Persist/store the new refresh token in DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      user_id: user.id,
      token: new_refresh_token,
      expires_at: expiresAt,
    },
  });

  return { access_token: new_access_token, refresh_token: new_refresh_token };
};

const logoutUser = async ({ refresh_token }) => {
  const prisma = await getPrismaClient();

  // Look up the refresh token in the database
  const dbToken = await prisma.refreshToken.findUnique({
    where: { token: refresh_token },
  });

  // If found, mark it as revoked
  if (dbToken) {
    await prisma.refreshToken.update({
      where: { token: refresh_token },
      data: { is_revoked: true },
    });
  }

  return { message: "Logged out successfully" };
};

module.exports = { registerUser, loginUser, refreshUserTokens, logoutUser };
