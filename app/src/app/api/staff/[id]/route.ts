import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(staff);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, role, status, phone, joinedAt } = body;

  const staff = await prisma.staff.update({
    where: { id },
    data: {
      name,
      role,
      status,
      phone: phone || null,
      joinedAt: joinedAt ? new Date(joinedAt) : undefined,
    },
  });

  return NextResponse.json(staff);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.staff.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
