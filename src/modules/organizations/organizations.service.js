const getPrismaClient = require("../../config/db");

const createOrg = async ({ name }) => {
  const prisma = await getPrismaClient();

  // Check for duplicate organization name
  const duplicate = await prisma.organization.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (duplicate) {
    const error = new Error("Organization with this name already exists");
    error.name = "ConflictError";
    throw error;
  }

  const org = await prisma.organization.create({
    data: { name },
    select: {
      id: true,
      name: true,
      created_at: true,
    },
  });
  return org;
};

const listOrgs = async () => {
  const prisma = await getPrismaClient();
  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      created_at: true,
    },
  });
  return orgs;
};

const getOrgById = async (id) => {
  const prisma = await getPrismaClient();
  const org = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      created_at: true,
    },
  });

  if (!org) {
    const error = new Error("Organization not found");
    error.name = "NotFoundError";
    throw error;
  }

  return org;
};

const updateOrg = async (id, { name }) => {
  const prisma = await getPrismaClient();

  // Verify organization exists first
  const existing = await prisma.organization.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Organization not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Check for duplicate organization name (excluding current org)
  const duplicate = await prisma.organization.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      id: { not: id },
    },
  });

  if (duplicate) {
    const error = new Error("Organization with this name already exists");
    error.name = "ConflictError";
    throw error;
  }

  const org = await prisma.organization.update({
    where: { id },
    data: { name },
    select: {
      id: true,
      name: true,
      created_at: true,
    },
  });

  return org;
};

const deleteOrg = async (id) => {
  const prisma = await getPrismaClient();

  // Verify organization exists first
  const existing = await prisma.organization.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Organization not found");
    error.name = "NotFoundError";
    throw error;
  }

  await prisma.organization.delete({
    where: { id },
  });

  return { message: "Organization deleted successfully" };
};

module.exports = {
  createOrg,
  listOrgs,
  getOrgById,
  updateOrg,
  deleteOrg,
};
