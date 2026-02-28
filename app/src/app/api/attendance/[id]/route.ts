import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - clock out or update attendance record
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { timeOut, status, note } = body;

  const record = await prisma.attendance.update({
    where: { id },
    data: {
      ...(timeOut !== undefined && { timeOut: timeOut ? new Date(timeOut) : new Date() }),
      ...(status !== undefined && { status }),
      ...(note !== undefined && { note }),
    },
  });

  return NextResponse.json(record);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.attendance.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
