import { config } from "dotenv";
config();

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  // Create a default shop for the seed account
  const shop = await prisma.shop.upsert({
    where: { id: "seed-shop" },
    update: {},
    create: {
      id: "seed-shop",
      name: "Demo Coffee Shop",
    },
  });

  const owner = await prisma.staff.upsert({
    where: { email: "admin@coffman.com" },
    update: {},
    create: {
      shopId: shop.id,
      name: "Admin",
      email: "admin@coffman.com",
      password,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  console.log(`✓ Seeded shop: ${shop.name}`);
  console.log(`✓ Seeded OWNER account: ${owner.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
