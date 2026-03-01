"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Ingredient = { id: string; name: string; currentStock: number; lowStockAlert: number; unit: string };

type StockLog = {
  id: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  note: string | null;
  createdAt: string;
  ingredient: { name: string; unit: string };
};

type TopProduct = { id: string; name: string; category: string; quantity: number; revenue: number };

type ReportData = {
  inventory: { total: number; lowStockCount: number; lowStockItems: Ingredient[] };
  stockMovement: { totalIn: number; totalOut: number; logs: StockLog[] };
  staff: { total: number; active: number; inactive: number };
  sales: {
    monthlyRevenue: number;
    totalOrders: number;
    topProducts: TopProduct[];
    paymentBreakdown: Record<string, number>;
  };
};

const paymentLabel: Record<string, string> = { CASH: "Cash", CARD: "Card", EWALLET: "E-Wallet" };
const paymentColor: Record<string, string> = {
  CASH: "bg-green-100 text-green-800 hover:bg-green-100",
  CARD: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  EWALLET: "bg-purple-100 text-purple-800 hover:bg-purple-100",
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?month=${month}`);
    setData(await res.json());
    setLoading(false);
  }, [month]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const monthLabel = new Date(month + "-01").toLocaleString("en-MY", { month: "long", year: "numeric" });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {loading || !data ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <>
          {/* Sales Summary */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Sales — {monthLabel}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-700">RM {data.sales.monthlyRevenue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Monthly Revenue</div>
              </div>
              <div className="border rounded-xl p-4">
                <div className="text-2xl font-bold">{data.sales.totalOrders}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Orders</div>
              </div>
              <div className="border rounded-xl p-4">
                <div className="text-2xl font-bold">
                  {data.sales.totalOrders > 0
                    ? `RM ${(data.sales.monthlyRevenue / data.sales.totalOrders).toFixed(2)}`
                    : "—"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Avg Order Value</div>
              </div>
              <div className="border rounded-xl p-4 space-y-1">
                <div className="text-sm text-muted-foreground mb-2">Payment Breakdown</div>
                {Object.keys(data.sales.paymentBreakdown).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                  Object.entries(data.sales.paymentBreakdown).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between">
                      <Badge className={`text-xs ${paymentColor[method]}`}>{paymentLabel[method]}</Badge>
                      <span className="text-xs font-medium">RM {amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Top Products */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Top Products — {monthLabel}</h2>
            {data.sales.topProducts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border rounded-xl">
                No sales recorded this month.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue (RM)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sales.topProducts.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category}</TableCell>
                      <TableCell className="text-right">{p.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{p.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          {/* Operations */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Operations — Last 30 Days</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Ingredients", value: String(data.inventory.total) },
                { label: "Low Stock Items", value: String(data.inventory.lowStockCount), warn: data.inventory.lowStockCount > 0 },
                { label: "Active Staff", value: `${data.staff.active} / ${data.staff.total}` },
                { label: "Stock In (30d)", value: `+${data.stockMovement.totalIn.toFixed(1)}` },
                { label: "Stock Out (30d)", value: `-${data.stockMovement.totalOut.toFixed(1)}` },
              ].map((s) => (
                <div key={s.label} className={`border rounded-xl p-4 ${s.warn ? "border-red-200 bg-red-50" : ""}`}>
                  <div className={`text-2xl font-bold ${s.warn ? "text-red-500" : "text-foreground"}`}>{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Low Stock Alert */}
          {data.inventory.lowStockItems.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Low Stock Items</h2>
              <div className="border rounded-xl divide-y">
                {data.inventory.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-red-500">
                      {item.currentStock} / {item.lowStockAlert} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stock Movement */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Stock Movement (Last 30 days)</h2>
            {data.stockMovement.logs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border rounded-xl">
                No stock changes in the last 30 days.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.stockMovement.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.ingredient.name}</TableCell>
                      <TableCell>
                        {log.type === "STOCK_IN" ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Stock In</Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Stock Out</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.type === "STOCK_IN" ? "+" : "-"}{log.quantity} {log.ingredient.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.note ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
