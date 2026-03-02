import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const item = await prisma.menuItem.findFirst({
    where: { id, shopId: session.shopId },
    include: { recipe: { include: { ingredient: true } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
});

export const PUT = withAuth(async (req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const { name, category, price, status, recipe } = body;

  const existing = await prisma.menuItem.findFirst({ where: { id, shopId: session.shopId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(category && { category }),
      ...(price != null && { price: parseFloat(price) }),
      ...(status && { status }),
      ...(recipe && {
        recipe: {
          deleteMany: {},
          create: recipe.map((r: { ingredientId: string; quantity: number }) => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(String(r.quantity)),
          })),
        },
      }),
    },
    include: { recipe: { include: { ingredient: true } } },
  });

  return NextResponse.json(item);
});

export const DELETE = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const existing = await prisma.menuItem.findFirst({ where: { id, shopId: session.shopId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
