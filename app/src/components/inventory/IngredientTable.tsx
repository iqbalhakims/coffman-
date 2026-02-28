"use client";

import { useRouter } from "next/navigation";
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
import { IngredientForm } from "./IngredientForm";
import { StockLogForm } from "./StockLogForm";
import type { Ingredient } from "@/lib/types";

type Props = {
  ingredients: Ingredient[];
  onRefresh: () => void;
};

export function IngredientTable({ ingredients, onRefresh }: Props) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Alert At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ingredients.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
              No ingredients yet. Add one to get started.
            </TableCell>
          </TableRow>
        )}
        {ingredients.map((item) => {
          const isLow = item.lowStockAlert > 0 && item.currentStock <= item.lowStockAlert;
          return (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/inventory/${item.id}`)}
            >
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.currentStock}</TableCell>
              <TableCell>{item.lowStockAlert || "—"}</TableCell>
              <TableCell>
                {isLow ? (
                  <Badge variant="destructive">Low Stock</Badge>
                ) : (
                  <Badge variant="secondary">OK</Badge>
                )}
              </TableCell>
              <TableCell>
                <div
                  className="flex justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StockLogForm
                    ingredientId={item.id}
                    ingredientName={item.name}
                    onSuccess={onRefresh}
                  />
                  <IngredientForm ingredient={item} onSuccess={onRefresh} />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(item.id, item.name)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
