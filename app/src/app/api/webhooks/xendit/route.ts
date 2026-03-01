import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const callbackToken = req.headers.get("x-callback-token");
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

  if (!expectedToken || callbackToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.id || !body.status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const xenditInvoiceId: string = body.id;
  const xenditStatus: string = body.status;

  const sub = await prisma.subscription.findFirst({
    where: { xenditInvoiceId },
  });

  if (!sub) {
    // Not found — not our invoice, return 200 to avoid Xendit retries
    return NextResponse.json({ received: true });
  }

  if (xenditStatus === "PAID") {
    // Extend period from now
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
