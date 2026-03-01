import { config } from "dotenv";
config();

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const owner = await prisma.staff.upsert({
    where: { email: "admin@coffman.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@coffman.com",
      password,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  console.log(`✓ Seeded OWNER account: ${owner.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
