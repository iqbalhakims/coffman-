import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, _ctx, session: SessionPayload) => {
  const items = await prisma.menuItem.findMany({
    where: { shopId: session.shopId },
    orderBy: { name: "asc" },
    include: {
      recipe: {
        include: { ingredient: true },
      },
    },
  });
  return NextResponse.json(items);
});

export const POST = withAuth(async (req: NextRequest, _ctx, session: SessionPayload) => {
  const body = await req.json();
  const { name, category, price, status, recipe } = body;

  if (!name || !category || price == null) {
    return NextResponse.json({ error: "name, category, and price are required" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      shopId: session.shopId,
      name,
      category,
      price: parseFloat(price),
      status: status ?? "ACTIVE",
      recipe: recipe?.length
        ? {
            create: recipe.map((r: { ingredientId: string; quantity: number }) => ({
              ingredientId: r.ingredientId,
              quantity: parseFloat(String(r.quantity)),
            })),
          }
        : undefined,
    },
    include: {
      recipe: { include: { ingredient: true } },
    },
  });

  return NextResponse.json(item, { status: 201 });
});
