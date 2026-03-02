import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

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

export const GET = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const staff = await prisma.staff.findFirst({
    where: { id, shopId: session.shopId },
    select: safeSelect,
  });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(staff);
});

export const PUT = withAuth(async (req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const { name, email, password, role, status, phone, joinedAt } = body;

  const existing = await prisma.staff.findFirst({ where: { id, shopId: session.shopId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
});

export const DELETE = withAuth(async (_req: NextRequest, ctx, session: SessionPayload) => {
  const { id } = await ctx.params;
  const existing = await prisma.staff.findFirst({ where: { id, shopId: session.shopId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.staff.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
