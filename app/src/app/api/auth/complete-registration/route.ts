import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { token, shopName, name, password } = body as {
    token?: string;
    shopName?: string;
    name?: string;
    password?: string;
  };

  if (!token || !shopName || !name || !password) {
    return NextResponse.json(
      { error: "token, shopName, name, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const pending = await prisma.pendingRegistration.findUnique({ where: { token } });

  if (!pending) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }
  if (pending.status === "COMPLETED") {
    return NextResponse.json({ error: "This link has already been used" }, { status: 409 });
  }
  if (pending.status !== "PAID") {
    return NextResponse.json({ error: "Payment has not been confirmed yet" }, { status: 402 });
  }
  if (pending.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired. Please subscribe again." }, { status: 410 });
  }

  // Check email isn't already registered
  const existingStaff = await prisma.staff.findUnique({ where: { email: pending.email } });
  if (existingStaff) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const now = new Date();
  const periodEnd = new Date(now);
  if (pending.billingCycle === "MONTHLY") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  const [shop, staff] = await prisma.$transaction(async (tx) => {
    const newShop = await tx.shop.create({ data: { name: shopName } });

    const newStaff = await tx.staff.create({
      data: {
        shopId: newShop.id,
        name,
        email: pending.email,
        password: hashedPassword,
        role: "OWNER",
      },
    });

    await tx.subscription.create({
      data: {
        shopId: newShop.id,
        billingCycle: pending.billingCycle,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        xenditInvoiceId: pending.xenditInvoiceId,
        xenditPaymentUrl: pending.xenditPaymentUrl,
      },
    });

    await tx.pendingRegistration.update({
      where: { token },
      data: { status: "COMPLETED" },
    });

    return [newShop, newStaff];
  });

  const jwtToken = await signToken({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    shopId: shop.id,
  });

  const res = NextResponse.json({ redirect: "/inventory" }, { status: 201 });
  res.cookies.set(sessionCookieOptions(jwtToken));
  return res;
}
