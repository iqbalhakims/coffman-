import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;

  // Ensure ingredient belongs to this shop
  const ingredient = await prisma.ingredient.findFirst({
    where: { id, shopId: session.shopId },
  });
  if (!ingredient) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logs = await prisma.stockLog.findMany({
    where: { ingredientId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(logs);
});
