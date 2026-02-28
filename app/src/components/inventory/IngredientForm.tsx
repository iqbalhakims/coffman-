"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Ingredient } from "@/lib/types";

type Props = {
  ingredient?: Ingredient;
  onSuccess: () => void;
};

export function IngredientForm({ ingredient, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: ingredient?.name ?? "",
    unit: ingredient?.unit ?? "",
    currentStock: ingredient?.currentStock ?? 0,
    lowStockAlert: ingredient?.lowStockAlert ?? 0,
  });

  const isEdit = !!ingredient;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = isEdit ? `/api/ingredients/${ingredient.id}` : "/api/ingredients";
    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    setOpen(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "default"} size={isEdit ? "sm" : "default"}>
          {isEdit ? "Edit" : "Add Ingredient"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Coffee Beans"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Unit</Label>
            <Input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="e.g. kg, liter, pcs"
              required
            />
          </div>
          {!isEdit && (
            <div className="space-y-1">
              <Label>Initial Stock</Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label>Low Stock Alert Threshold</Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={form.lowStockAlert}
              onChange={(e) => setForm({ ...form, lowStockAlert: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
