import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  joinedAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await prisma.staff.findUnique({ where: { id }, select: safeSelect });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(staff);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, email, password, role, status, phone, joinedAt } = body;

  const data: Record<string, unknown> = {
    name,
    role,
    status,
    phone: phone || null,
    joinedAt: joinedAt ? new Date(joinedAt) : undefined,
  };

  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 10);

  const staff = await prisma.staff.update({
    where: { id },
    data,
    select: safeSelect,
  });

  return NextResponse.json(staff);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.staff.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
