import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const callbackToken = req.headers.get("x-callback-token");
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

  if (!expectedToken || callbackToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.external_id || !body.status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const externalId: string = body.external_id;
  const xenditInvoiceId: string = body.id;
  const xenditStatus: string = body.status;

  // ── Pre-payment registration (new shop onboarding) ───────────────────────
  if (externalId.startsWith("coffman-pending-")) {
    const token = externalId.replace("coffman-pending-", "");

    const pending = await prisma.pendingRegistration.findUnique({ where: { token } });
    if (!pending || pending.status === "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    if (xenditStatus === "PAID") {
      await prisma.pendingRegistration.update({
        where: { token },
        data: { status: "PAID" },
      });
    } else if (xenditStatus === "EXPIRED") {
      // Mark as completed so the token can no longer be used
      await prisma.pendingRegistration.update({
        where: { token },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ received: true });
  }

  // ── Subscription renewal (existing shop) ─────────────────────────────────
  const sub = await prisma.subscription.findFirst({
    where: { xenditInvoiceId },
  });

  if (!sub) {
    return NextResponse.json({ received: true });
  }

  if (xenditStatus === "PAID") {
    const now = new Date();
    const periodEnd = new Date(now);
    if (sub.billingCycle === "MONTHLY") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  } else if (xenditStatus === "EXPIRED") {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });
  }

  return NextResponse.json({ received: true });
}
