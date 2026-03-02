import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { createXenditInvoice } from "@/lib/xendit";

const PRICES: Record<"MONTHLY" | "ANNUAL", number> = {
  MONTHLY: 90,
  ANNUAL: 948,
};

// POST — create a pending registration + Xendit invoice (no auth required)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, billingCycle } = body as { email?: string; billingCycle?: string };

  if (!email || !billingCycle || !["MONTHLY", "ANNUAL"].includes(billingCycle)) {
    return NextResponse.json(
      { error: "email and billingCycle (MONTHLY or ANNUAL) are required" },
      { status: 400 }
    );
  }

  // Block if email already has an active shop subscription
  const existingStaff = await prisma.staff.findUnique({ where: { email } });
  if (existingStaff) {
    const activeSub = await prisma.subscription.findUnique({
      where: { shopId: existingStaff.shopId },
    });
    if (activeSub?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "An account with this email already has an active subscription." },
        { status: 409 }
      );
    }
  }

  const cycle = billingCycle as "MONTHLY" | "ANNUAL";
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let invoice: { id: string; invoice_url: string };
  try {
    invoice = await createXenditInvoice({
      externalId: `coffman-pending-${token}`,
      amount: PRICES[cycle],
      payerEmail: email,
      description:
        cycle === "MONTHLY"
          ? "Coffman Monthly Plan — RM 90/month"
          : "Coffman Annual Plan — RM 948/year (RM 79/month)",
      successRedirectUrl: `${appUrl}/setup?token=${token}`,
      failureRedirectUrl: `${appUrl}/?payment=failed`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment provider error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await prisma.pendingRegistration.create({
    data: {
      token,
      email,
      billingCycle: cycle,
      status: "AWAITING_PAYMENT",
      xenditInvoiceId: invoice.id,
      xenditPaymentUrl: invoice.invoice_url,
      expiresAt,
    },
  });

  return NextResponse.json({ paymentUrl: invoice.invoice_url }, { status: 201 });
}

// GET — check status of a pending registration by token (for /setup page)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const pending = await prisma.pendingRegistration.findUnique({ where: { token } });
  if (!pending || pending.status === "COMPLETED") {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  if (pending.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired. Please subscribe again." }, { status: 410 });
  }

  return NextResponse.json({
    status: pending.status,
    email: pending.email,
    billingCycle: pending.billingCycle,
  });
}
