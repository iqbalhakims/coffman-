import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, _ctx, session: SessionPayload) => {
  const body = await req.json();
  const { ingredientId, type, quantity, note } = body;

  if (!ingredientId || !type || !quantity) {
    return NextResponse.json(
      { error: "ingredientId, type, and quantity are required" },
      { status: 400 }
    );
  }

  if (!["STOCK_IN", "STOCK_OUT"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const ingredient = await prisma.ingredient.findFirst({
    where: { id: ingredientId, shopId: session.shopId },
  });

  if (!ingredient) {
    return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
  }

  const delta = type === "STOCK_IN" ? quantity : -quantity;
  const newStock = ingredient.currentStock + delta;

  if (newStock < 0) {
    return NextResponse.json(
      { error: "Insufficient stock" },
      { status: 400 }
    );
  }

  const [log] = await prisma.$transaction([
    prisma.stockLog.create({
      data: { ingredientId, type, quantity, note },
    }),
    prisma.ingredient.update({
      where: { id: ingredientId },
      data: { currentStock: newStock },
    }),
  ]);

  return NextResponse.json(log, { status: 201 });
});
