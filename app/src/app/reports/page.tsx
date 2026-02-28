"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportData = {
  inventory: {
    total: number;
    lowStockCount: number;
    lowStockItems: { id: string; name: string; currentStock: number; lowStockAlert: number; unit: string }[];
  };
  stockMovement: {
    totalIn: number;
    totalOut: number;
    logs: {
      id: string;
      type: "STOCK_IN" | "STOCK_OUT";
      quantity: number;
      note: string | null;
      createdAt: string;
      ingredient: { name: string; unit: string };
    }[];
  };
  staff: {
    total: number;
    active: number;
    inactive: number;
  };
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  if (!data) return null;

  const stats = [
    { label: "Total Ingredients", value: data.inventory.total },
    { label: "Low Stock", value: data.inventory.lowStockCount, warn: data.inventory.lowStockCount > 0 },
    { label: "Total Staff", value: data.staff.total },
    { label: "Active Staff", value: data.staff.active },
    { label: "Stock In (30d)", value: data.stockMovement.totalIn.toFixed(1) },
    { label: "Stock Out (30d)", value: data.stockMovement.totalOut.toFixed(1) },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Overview of the last 30 days</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border rounded-xl p-4 bg-card">
            <div className={`text-2xl font-bold ${s.warn ? "text-red-500" : "text-foreground"}`}>
              {s.value}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {data.inventory.lowStockItems.length > 0 && (
        <div>
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
        </div>
      )}

      {/* Stock Movement */}
      <div>
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
      </div>
    </div>
  );
}
