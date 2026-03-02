import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;

  const staff = await prisma.staff.findFirst({ where: { id, shopId: session.shopId } });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const requests = await prisma.leaveRequest.findMany({
    where: { staffId: id },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(requests);
});

export const POST = withAuth(async (req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const { type, startDate, endDate, reason } = body;

  if (!type || !startDate || !endDate) {
    return NextResponse.json({ error: "type, startDate, endDate are required" }, { status: 400 });
  }

  const staff = await prisma.staff.findFirst({ where: { id, shopId: session.shopId } });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  const request = await prisma.leaveRequest.create({
    data: {
      staffId: id,
      type,
      startDate: start,
      endDate: end,
      reason: reason ?? null,
    },
  });

  return NextResponse.json(request, { status: 201 });
});
