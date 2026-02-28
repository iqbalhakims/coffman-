import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logs = await prisma.stockLog.findMany({
    where: { ingredientId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(logs);
}
