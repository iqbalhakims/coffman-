"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
};

type CartItem = { menuItem: MenuItem; quantity: number };

export default function SaleForm() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "EWALLET">("CASH");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data: MenuItem[]) => setMenuItems(data.filter((m) => m.status === "ACTIVE")));
  }, []);

  const categories = Array.from(new Set(menuItems.map((m) => m.category)));
  const filtered = menuItems.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }

  function updateQty(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => c.menuItem.id === itemId ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    );
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  }

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  async function handleSubmit() {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod,
        note: note || undefined,
        items: cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity })),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to record sale");
      setLoading(false);
      return;
    }

    router.push("/sales");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Menu Grid */}
      <div className="lg:col-span-2 space-y-4">
        <Input
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {categories.map((cat) => {
          const catItems = filtered.filter((m) => m.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {catItems.map((item) => {
                  const inCart = cart.find((c) => c.menuItem.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="relative text-left border rounded-lg p-3 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                    >
                      {inCart && (
                        <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-xs">
                          ×{inCart.quantity}
                        </Badge>
                      )}
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-muted-foreground text-sm mt-1">RM {item.price.toFixed(2)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {menuItems.length === 0 && (
          <p className="text-muted-foreground text-sm">No active menu items. Add items in the Menu module first.</p>
        )}
      </div>

      {/* Cart / Order Summary */}
      <div className="border rounded-lg p-4 space-y-4 flex flex-col">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold">Order</h2>
        </div>

        <div className="flex-1 space-y-2 min-h-[120px]">
          {cart.length === 0 && (
            <p className="text-sm text-muted-foreground">Tap items to add to order</p>
          )}
          {cart.map((c) => (
            <div key={c.menuItem.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.menuItem.name}</p>
                <p className="text-xs text-muted-foreground">RM {c.menuItem.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(c.menuItem.id, -1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm w-6 text-center">{c.quantity}</span>
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(c.menuItem.id, 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(c.menuItem.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>RM {total.toFixed(2)}</span>
          </div>

          <div className="space-y-1">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="EWALLET">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Note (optional)</Label>
            <Textarea
              placeholder="e.g. takeaway, extra shot..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={cart.length === 0 || loading}
            onClick={handleSubmit}
          >
            {loading ? "Recording..." : "Record Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
}
