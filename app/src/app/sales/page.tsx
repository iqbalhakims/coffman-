"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import SaleTable from "@/components/sales/SaleTable";

type SaleItem = {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  menuItem: { name: string };
};

type Sale = {
  id: string;
  total: number;
  paymentMethod: "CASH" | "CARD" | "EWALLET";
  note: string | null;
  soldAt: string;
  items: SaleItem[];
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to current month
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/sales?month=${month}`);
    const data = await res.json();
    setSales(data);
    setLoading(false);
  }, [month]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {sales.length} orders &bull; RM {totalRevenue.toFixed(2)} this month
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/sales/new">
              <Plus className="h-4 w-4 mr-2" /> New Sale
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <SaleTable sales={sales} />
      )}
    </div>
  );
}
