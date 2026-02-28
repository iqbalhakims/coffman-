import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(ingredients);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, unit, currentStock, lowStockAlert } = body;

  if (!name || !unit) {
    return NextResponse.json({ error: "name and unit are required" }, { status: 400 });
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      name,
      unit,
      currentStock: currentStock ?? 0,
      lowStockAlert: lowStockAlert ?? 0,
    },
  });

  return NextResponse.json(ingredient, { status: 201 });
}
