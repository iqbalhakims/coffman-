import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await prisma.staff.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      joinedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role, phone, joinedAt } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "name, email, password, and role are required" }, { status: 400 });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        phone: phone || null,
        joinedAt: joinedAt ? new Date(joinedAt) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(staff, { status: 201 });
  } catch (err) {
    console.error("POST /api/staff error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
