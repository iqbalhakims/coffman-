import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const ingredient = await prisma.ingredient.findFirst({
    where: { id, shopId: session.shopId },
    include: { stockLogs: { orderBy: { createdAt: "desc" } } },
  });

  if (!ingredient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(ingredient);
});

export const PUT = withAuth(async (req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const { name, unit, lowStockAlert } = body;

  const existing = await prisma.ingredient.findFirst({ where: { id, shopId: session.shopId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: { name, unit, lowStockAlert },
  });

  return NextResponse.json(ingredient);
});

export const DELETE = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const existing = await prisma.ingredient.findFirst({ where: { id, shopId: session.shopId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.ingredient.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
