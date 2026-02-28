import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requests = await prisma.leaveRequest.findMany({
    where: { staffId: id },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { type, startDate, endDate, reason } = body;

  if (!type || !startDate || !endDate) {
    return NextResponse.json({ error: "type, startDate, endDate are required" }, { status: 400 });
  }

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
}
