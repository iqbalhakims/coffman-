import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [ingredients, stockLogs, staff] = await Promise.all([
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
    prisma.stockLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { ingredient: { select: { name: true, unit: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.staff.findMany({ orderBy: { name: "asc" } }),
  ]);

  const lowStock = ingredients.filter(
    (i) => i.lowStockAlert > 0 && i.currentStock <= i.lowStockAlert
  );

  const totalStockIn = stockLogs
    .filter((l) => l.type === "STOCK_IN")
    .reduce((sum, l) => sum + l.quantity, 0);

  const totalStockOut = stockLogs
    .filter((l) => l.type === "STOCK_OUT")
    .reduce((sum, l) => sum + l.quantity, 0);

  const activeStaff = staff.filter((s) => s.status === "ACTIVE").length;

  return NextResponse.json({
    inventory: {
      total: ingredients.length,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock,
    },
    stockMovement: {
      totalIn: totalStockIn,
      totalOut: totalStockOut,
      logs: stockLogs,
    },
    staff: {
      total: staff.length,
      active: activeStaff,
      inactive: staff.length - activeStaff,
    },
  });
}
