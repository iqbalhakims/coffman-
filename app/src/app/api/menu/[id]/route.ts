import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { recipe: { include: { ingredient: true } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, category, price, status, recipe } = body;

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(category && { category }),
      ...(price != null && { price: parseFloat(price) }),
      ...(status && { status }),
      ...(recipe && {
        recipe: {
          deleteMany: {},
          create: recipe.map((r: { ingredientId: string; quantity: number }) => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(String(r.quantity)),
          })),
        },
      }),
    },
    include: { recipe: { include: { ingredient: true } } },
  });

  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
