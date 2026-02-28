import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status, type, startDate, endDate, reason } = body;

  const request = await prisma.leaveRequest.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(type !== undefined && { type }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(reason !== undefined && { reason }),
    },
  });

  return NextResponse.json(request);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.leaveRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
