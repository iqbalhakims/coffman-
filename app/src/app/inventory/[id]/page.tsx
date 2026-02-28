"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockLogForm } from "@/components/inventory/StockLogForm";
import { IngredientForm } from "@/components/inventory/IngredientForm";
import type { IngredientWithLogs } from "@/lib/types";

export default function IngredientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<IngredientWithLogs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/ingredients/${id}`);
    if (!res.ok) { router.push("/inventory"); return; }
    setData(await res.json());
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  if (!data) return null;

  const isLow = data.lowStockAlert > 0 && data.currentStock <= data.lowStockAlert;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/inventory")}>
          ← Back
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            {isLow ? (
              <Badge variant="destructive">Low Stock</Badge>
            ) : (
              <Badge variant="secondary">OK</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Current stock:{" "}
            <span className="font-semibold text-foreground">
              {data.currentStock} {data.unit}
            </span>
            {data.lowStockAlert > 0 && (
              <span className="ml-2">· Alert at {data.lowStockAlert} {data.unit}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <StockLogForm
            ingredientId={data.id}
            ingredientName={data.name}
            onSuccess={fetchData}
          />
          <IngredientForm ingredient={data} onSuccess={fetchData} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Stock History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.stockLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No stock changes recorded yet.
                </TableCell>
              </TableRow>
            )}
            {data.stockLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {log.type === "STOCK_IN" ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Stock In</Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Stock Out</Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {log.type === "STOCK_IN" ? "+" : "-"}{log.quantity} {data.unit}
                </TableCell>
                <TableCell className="text-muted-foreground">{log.note ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
