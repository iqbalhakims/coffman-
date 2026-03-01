import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // format: "2026-03"

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Monthly date range for sales
  const now = new Date();
  let monthStart: Date;
  let monthEnd: Date;
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    monthStart = new Date(year, mon - 1, 1);
    monthEnd = new Date(year, mon, 1);
  } else {
    monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const [ingredients, stockLogs, staff, monthlySales] = await Promise.all([
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
    prisma.stockLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { ingredient: { select: { name: true, unit: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.staff.findMany({ orderBy: { name: "asc" } }),
    prisma.sale.findMany({
      where: { soldAt: { gte: monthStart, lt: monthEnd } },
      include: {
        items: { include: { menuItem: true } },
      },
    }),
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

  // Sales aggregations
  const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = monthlySales.length;

  // Payment method breakdown
  const paymentBreakdown = monthlySales.reduce(
    (acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] ?? 0) + s.total;
      return acc;
    },
    {} as Record<string, number>
  );

  // Top products by quantity sold
  const productSales = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();
  for (const sale of monthlySales) {
    for (const item of sale.items) {
      const existing = productSales.get(item.menuItemId) ?? {
        name: item.menuItem.name,
        category: item.menuItem.category,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.subtotal;
      productSales.set(item.menuItemId, existing);
    }
  }

  const topProducts = Array.from(productSales.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Daily sales for chart (current month)
  const dailySales = monthlySales.reduce(
    (acc, s) => {
      const day = new Date(s.soldAt).toISOString().split("T")[0];
      acc[day] = (acc[day] ?? 0) + s.total;
      return acc;
    },
    {} as Record<string, number>
  );

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
    sales: {
      monthlyRevenue,
      totalOrders,
      topProducts,
      paymentBreakdown,
      dailySales,
    },
  });
}
