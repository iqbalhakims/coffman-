import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, _ctx, session: SessionPayload) => {
  const month = req.nextUrl.searchParams.get("month"); // format: "2026-03"

  let dateFilter = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    dateFilter = {
      soldAt: {
        gte: new Date(year, mon - 1, 1),
        lt: new Date(year, mon, 1),
      },
    };
  }

  const sales = await prisma.sale.findMany({
    where: { shopId: session.shopId, ...dateFilter },
    orderBy: { soldAt: "desc" },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  return NextResponse.json(sales);
});

export const POST = withAuth(async (req: NextRequest, _ctx, session: SessionPayload) => {
  const body = await req.json();
  const { paymentMethod, note, items } = body;

  if (!paymentMethod || !items?.length) {
    return NextResponse.json({ error: "paymentMethod and items are required" }, { status: 400 });
  }

  // Load menu items (scoped to this shop) with their recipes
  const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, shopId: session.shopId },
    include: { recipe: true },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  // Validate all items exist
  for (const item of items) {
    if (!menuItemMap.has(item.menuItemId)) {
      return NextResponse.json({ error: `Menu item ${item.menuItemId} not found` }, { status: 400 });
    }
  }

  // Calculate total
  const total = items.reduce((sum: number, item: { menuItemId: string; quantity: number }) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    return sum + menuItem.price * item.quantity;
  }, 0);

  // Build stock deductions: ingredientId -> total quantity to deduct
  const stockDeductions = new Map<string, number>();
  for (const item of items) {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    for (const recipeItem of menuItem.recipe) {
      const current = stockDeductions.get(recipeItem.ingredientId) ?? 0;
      stockDeductions.set(recipeItem.ingredientId, current + recipeItem.quantity * item.quantity);
    }
  }

  // Validate stock levels before proceeding
  if (stockDeductions.size > 0) {
    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: Array.from(stockDeductions.keys()) }, shopId: session.shopId },
    });
    for (const ingredient of ingredients) {
      const needed = stockDeductions.get(ingredient.id) ?? 0;
      if (ingredient.currentStock < needed) {
        return NextResponse.json(
          { error: `Not enough stock for "${ingredient.name}". Available: ${ingredient.currentStock} ${ingredient.unit}, needed: ${needed} ${ingredient.unit}` },
          { status: 400 }
        );
      }
    }
  }

  // Atomic transaction: create sale + sale items + deduct stock
  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        shopId: session.shopId,
        total,
        paymentMethod,
        note: note ?? null,
        items: {
          create: items.map((item: { menuItemId: string; quantity: number }) => {
            const menuItem = menuItemMap.get(item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: menuItem.price,
              subtotal: menuItem.price * item.quantity,
            };
          }),
        },
      },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    // Deduct stock and log STOCK_OUT for each ingredient
    for (const [ingredientId, quantity] of stockDeductions) {
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: { currentStock: { decrement: quantity } },
      });
      await tx.stockLog.create({
        data: {
          ingredientId,
          type: "STOCK_OUT",
          quantity,
          note: `Auto: Sale #${newSale.id.slice(-6).toUpperCase()}`,
        },
      });
    }

    return newSale;
  });

  return NextResponse.json(sale, { status: 201 });
});
