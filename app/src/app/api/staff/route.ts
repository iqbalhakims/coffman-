import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await prisma.staff.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, role, phone, joinedAt } = body;

  if (!name || !role) {
    return NextResponse.json({ error: "name and role are required" }, { status: 400 });
  }

  const staff = await prisma.staff.create({
    data: {
      name,
      role,
      phone: phone || null,
      joinedAt: joinedAt ? new Date(joinedAt) : undefined,
    },
  });

  return NextResponse.json(staff, { status: 201 });
}
