import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
    include: { stockLogs: { orderBy: { createdAt: "desc" } } },
  });

  if (!ingredient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(ingredient);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, unit, lowStockAlert } = body;

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: { name, unit, lowStockAlert },
  });

  return NextResponse.json(ingredient);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.ingredient.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
