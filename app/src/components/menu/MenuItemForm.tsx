"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

type Ingredient = { id: string; name: string; unit: string };

type RecipeRow = { ingredientId: string; quantity: string };

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
  recipe: { id: string; quantity: number; ingredient: Ingredient }[];
};

type Props = {
  item?: MenuItem | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function MenuItemForm({ item, onClose, onSaved }: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(item?.status ?? "ACTIVE");
  const [recipe, setRecipe] = useState<RecipeRow[]>(
    item?.recipe.map((r) => ({ ingredientId: r.ingredient.id, quantity: String(r.quantity) })) ?? []
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ingredients")
      .then((r) => r.json())
      .then(setIngredients);
  }, []);

  function addRecipeRow() {
    setRecipe((prev) => [...prev, { ingredientId: "", quantity: "" }]);
  }

  function removeRecipeRow(index: number) {
    setRecipe((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRecipeRow(index: number, field: keyof RecipeRow, value: string) {
    setRecipe((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const validRecipe = recipe.filter((r) => r.ingredientId && r.quantity);
    const payload = {
      name,
      category,
      price: parseFloat(price),
      status,
      recipe: validRecipe.map((r) => ({ ingredientId: r.ingredientId, quantity: parseFloat(r.quantity) })),
    };

    const url = item ? `/api/menu/${item.id}` : "/api/menu";
    const method = item ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Latte" />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. Coffee" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Price (RM)</Label>
              <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "ACTIVE" | "INACTIVE")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Recipe (Ingredients used per 1 item)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRecipeRow}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {recipe.length === 0 && (
              <p className="text-sm text-muted-foreground">No recipe set — stock won&apos;t be deducted on sale.</p>
            )}
            {recipe.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select value={row.ingredientId} onValueChange={(v) => updateRecipeRow(i, "ingredientId", v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-24"
                  placeholder="Qty"
                  value={row.quantity}
                  onChange={(e) => updateRecipeRow(i, "quantity", e.target.value)}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRecipeRow(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
