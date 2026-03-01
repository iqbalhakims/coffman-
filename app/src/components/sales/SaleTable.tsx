"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

type Props = { sales: Sale[] };

const paymentColor: Record<string, string> = {
  CASH: "bg-green-100 text-green-800",
  CARD: "bg-blue-100 text-blue-800",
  EWALLET: "bg-purple-100 text-purple-800",
};

const paymentLabel: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  EWALLET: "E-Wallet",
};

export default function SaleTable({ sales }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & Time</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Total (RM)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No sales recorded yet.
            </TableCell>
          </TableRow>
        )}
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="text-sm">
              {new Date(sale.soldAt).toLocaleString("en-MY", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {sale.items.map((i) => `${i.menuItem.name} ×${i.quantity}`).join(", ")}
            </TableCell>
            <TableCell>
              <Badge className={paymentColor[sale.paymentMethod]}>
                {paymentLabel[sale.paymentMethod]}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">
              {sale.total.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
