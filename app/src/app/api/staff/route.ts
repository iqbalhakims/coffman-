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

export const GET = withAuth(async (_req: NextRequest, _ctx, session: SessionPayload) => {
  const staff = await prisma.staff.findMany({
    where: { shopId: session.shopId },
    orderBy: { name: "asc" },
    select: safeSelect,
  });
  return NextResponse.json(staff);
});

export const POST = withAuth(async (req: NextRequest, _ctx, session: SessionPayload) => {
  const body = await req.json();
  const { name, email, password, role, phone, joinedAt } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "name, email, password, and role are required" }, { status: 400 });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const staff = await prisma.staff.create({
      data: {
        shopId: session.shopId,
        name,
        email,
        password: hashed,
        role,
        phone: phone || null,
        joinedAt: joinedAt ? new Date(joinedAt) : undefined,
      },
      select: safeSelect,
    });
    return NextResponse.json(staff, { status: 201 });
  } catch (err) {
    console.error("POST /api/staff error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
});
