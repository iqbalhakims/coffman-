import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;

  // Ensure staff belongs to this shop
  const staff = await prisma.staff.findFirst({ where: { id, shopId: session.shopId } });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const records = await prisma.attendance.findMany({
    where: { staffId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
});

export const POST = withAuth(async (req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const { status, note, date } = body;

  // Ensure staff belongs to this shop
  const staff = await prisma.staff.findFirst({ where: { id, shopId: session.shopId } });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const today = date ? new Date(date) : new Date();
  today.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { staffId_date: { staffId: id, date: today } },
  });

  if (existing) {
    return NextResponse.json({ error: "Attendance already recorded for this date" }, { status: 409 });
  }

  const record = await prisma.attendance.create({
    data: {
      staffId: id,
      date: today,
      timeIn: new Date(),
      status: status ?? "PRESENT",
      note: note ?? null,
    },
  });

  return NextResponse.json(record, { status: 201 });
});
