let prisma;

async function getPrismaClient() {
  if (!prisma) {
    const { PrismaClient } = await import("../generated/prisma/client.ts");
    const { PrismaPg } = await import("@prisma/adapter-pg");

    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

module.exports = getPrismaClient;
