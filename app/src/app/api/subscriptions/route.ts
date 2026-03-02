import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import { createXenditInvoice } from "@/lib/xendit";
import type { SessionPayload } from "@/lib/auth";

const PRICES: Record<"MONTHLY" | "ANNUAL", number> = {
  MONTHLY: 90,
  ANNUAL: 948,
};

export const POST = withAuth(async (req: NextRequest, _ctx, session: SessionPayload) => {
  const body = await req.json().catch(() => ({}));
  const billingCycle = body.billingCycle as "MONTHLY" | "ANNUAL";

  if (!billingCycle || !["MONTHLY", "ANNUAL"].includes(billingCycle)) {
    return NextResponse.json({ error: "billingCycle must be MONTHLY or ANNUAL" }, { status: 400 });
  }

  const existing = await prisma.subscription.findUnique({
    where: { staffId: session.id },
  });

  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
  }

  const staff = await prisma.staff.findUnique({ where: { id: session.id } });
  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  const now = new Date();
  const periodEnd = new Date(now);
  if (billingCycle === "MONTHLY") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const externalId = `coffman-${session.id}-${Date.now()}`;

  let invoice: { id: string; invoice_url: string };
  try {
    invoice = await createXenditInvoice({
      externalId,
      amount: PRICES[billingCycle],
      payerEmail: staff.email,
      description:
        billingCycle === "MONTHLY"
          ? "Coffman Monthly Plan — RM 90/month"
          : "Coffman Annual Plan — RM 948/year (RM 79/month)",
      successRedirectUrl: `${appUrl}/inventory?subscribed=1`,
      failureRedirectUrl: `${appUrl}/?payment=failed`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment provider error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await prisma.subscription.upsert({
    where: { staffId: session.id },
    update: {
      billingCycle,
      status: "PENDING_PAYMENT",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      xenditInvoiceId: invoice.id,
      xenditPaymentUrl: invoice.invoice_url,
    },
    create: {
      staffId: session.id,
      billingCycle,
      status: "PENDING_PAYMENT",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      xenditInvoiceId: invoice.id,
      xenditPaymentUrl: invoice.invoice_url,
    },
  });

  return NextResponse.json({ paymentUrl: invoice.invoice_url }, { status: 201 });
});
