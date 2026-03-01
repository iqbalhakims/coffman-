import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: { name: "asc" },
    include: {
      recipe: {
        include: { ingredient: true },
      },
    },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, category, price, status, recipe } = body;

  if (!name || !category || price == null) {
    return NextResponse.json({ error: "name, category, and price are required" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      name,
      category,
      price: parseFloat(price),
      status: status ?? "ACTIVE",
      recipe: recipe?.length
        ? {
            create: recipe.map((r: { ingredientId: string; quantity: number }) => ({
              ingredientId: r.ingredientId,
              quantity: parseFloat(String(r.quantity)),
            })),
          }
        : undefined,
    },
    include: {
      recipe: { include: { ingredient: true } },
    },
  });

  return NextResponse.json(item, { status: 201 });
}
