const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getPrismaClient = require("../../config/db");

const registerUser = async ({ email, password, organization_id, role }) => {
  const prisma = await getPrismaClient();

  // verify organization exists
  const org = await prisma.organization.findUnique({
    where: { id: organization_id },
  });

  if (!org) {
    const error = new Error("The specified organization does not exist");
    error.name = "ValidationError";
    throw error;
  }

  const password_hash = await bcryptjs.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      organization_id,
      role,
    },
  });

  return user;
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

  const access_token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { access_token, refresh_token: "" };
};

module.exports = { registerUser, loginUser };
