import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (_req: NextRequest, _ctx, session: SessionPayload) => {
  const sub = await prisma.subscription.findUnique({
    where: { shopId: session.shopId },
    select: {
      status: true,
      billingCycle: true,
      currentPeriodEnd: true,
      xenditPaymentUrl: true,
    },
  });

  if (!sub) {
    return NextResponse.json({ status: null });
  }

  // Auto-expire if period has passed
  if (sub.status === "ACTIVE" && sub.currentPeriodEnd < new Date()) {
    await prisma.subscription.update({
      where: { shopId: session.shopId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({
      status: "EXPIRED",
      billingCycle: sub.billingCycle,
      currentPeriodEnd: sub.currentPeriodEnd,
      xenditPaymentUrl: null,
    });
  }

  return NextResponse.json({
    status: sub.status,
    billingCycle: sub.billingCycle,
    currentPeriodEnd: sub.currentPeriodEnd,
    xenditPaymentUrl: sub.status === "PENDING_PAYMENT" ? sub.xenditPaymentUrl : null,
  });
});
