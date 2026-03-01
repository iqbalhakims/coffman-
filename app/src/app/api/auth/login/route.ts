import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { sessionCookieOptions } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, staff.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  });

  const res = NextResponse.json({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  });

  res.cookies.set(sessionCookieOptions(token));
  return res;
}
