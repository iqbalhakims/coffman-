"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Coffee, Package, Users, BarChart3, Home, UtensilsCrossed, ShoppingCart, LogOut, AlertTriangle } from "lucide-react";
import type { StaffRole } from "@/generated/prisma/client";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
};

type SubStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING_PAYMENT" | null;

const ROLE_LABEL: Record<StaffRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  BARISTA: "Barista",
};

const nav = [
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Sales", href: "/sales", icon: ShoppingCart },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Staff", href: "/staff", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [subStatus, setSubStatus] = useState<SubStatus>(undefined as unknown as SubStatus);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUser(data))
      .catch(() => {});

    fetch("/api/subscriptions/status")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSubStatus(data?.status ?? null))
      .catch(() => setSubStatus(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col bg-card">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <Coffee className="w-5 h-5 text-amber-700" />
          <span className="font-semibold text-base">Coffman</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          {user && (
            <div className="px-3 py-2 rounded-lg bg-muted/50">
              <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {user?.role === "OWNER" && subStatus !== "ACTIVE" && subStatus !== undefined && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {subStatus === null
                ? "You don't have an active subscription."
                : subStatus === "PENDING_PAYMENT"
                ? "Your payment is pending."
                : "Your subscription has expired."}
            </div>
            <Link
              href="/#pricing"
              className="text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded-md transition-colors shrink-0"
            >
              Subscribe now
            </Link>
          </div>
        )}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
