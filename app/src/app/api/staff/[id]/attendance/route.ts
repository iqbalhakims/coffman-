import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all attendance for a staff member
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = await prisma.attendance.findMany({
    where: { staffId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

// POST clock-in (creates today's attendance record)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status, note, date } = body;

  // Normalize to start of day in UTC
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
}
