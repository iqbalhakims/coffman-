"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MenuItemTable from "@/components/menu/MenuItemTable";
import MenuItemForm from "@/components/menu/MenuItemForm";

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

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/menu");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const activeCount = items.filter((i) => i.status === "ACTIVE").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {items.length} items &bull; {activeCount} active
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <MenuItemTable items={items} onRefresh={fetchItems} />
      )}

      {showAdd && (
        <MenuItemForm
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchItems(); }}
        />
      )}
    </div>
  );
}
