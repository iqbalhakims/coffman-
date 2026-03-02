import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, _ctx, session: SessionPayload) => {
  const ingredients = await prisma.ingredient.findMany({
    where: { shopId: session.shopId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(ingredients);
});

export const POST = withAuth(async (req: NextRequest, _ctx, session: SessionPayload) => {
  const body = await req.json();
  const { name, unit, currentStock, lowStockAlert } = body;

  if (!name || !unit) {
    return NextResponse.json({ error: "name and unit are required" }, { status: 400 });
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      shopId: session.shopId,
      name,
      unit,
      currentStock: currentStock ?? 0,
      lowStockAlert: lowStockAlert ?? 0,
    },
  });

  return NextResponse.json(ingredient, { status: 201 });
});
