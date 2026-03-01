"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import MenuItemForm from "./MenuItemForm";

type RecipeItem = {
  id: string;
  quantity: number;
  ingredient: { id: string; name: string; unit: string };
};

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
  recipe: RecipeItem[];
};

type Props = {
  items: MenuItem[];
  onRefresh: () => void;
};

export default function MenuItemTable({ items, onRefresh }: Props) {
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price (RM)</TableHead>
            <TableHead>Recipe</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No menu items yet. Add your first item.
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>RM {item.price.toFixed(2)}</TableCell>
              <TableCell>
                {item.recipe.length === 0 ? (
                  <span className="text-muted-foreground text-sm">No recipe</span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {item.recipe.map((r) => `${r.ingredient.name} ×${r.quantity}${r.ingredient.unit}`).join(", ")}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editItem && (
        <MenuItemForm
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
