"use client";

import { useCallback, useEffect, useState } from "react";
import { IngredientTable } from "@/components/inventory/IngredientTable";
import { IngredientForm } from "@/components/inventory/IngredientForm";
import type { Ingredient } from "@/lib/types";

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/ingredients");
    const data = await res.json();
    setIngredients(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const lowStockCount = ingredients.filter(
    (i) => i.lowStockAlert > 0 && i.currentStock <= i.lowStockAlert
  ).length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}
            {lowStockCount > 0 && (
              <span className="ml-2 text-red-500">· {lowStockCount} low stock</span>
            )}
          </p>
        </div>
        <IngredientForm onSuccess={fetchIngredients} />
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : (
        <IngredientTable ingredients={ingredients} onRefresh={fetchIngredients} />
      )}
    </div>
  );
}
