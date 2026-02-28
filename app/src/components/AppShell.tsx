"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Package, Users, BarChart3, Home } from "lucide-react";

const nav = [
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Staff", href: "/staff", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

        {/* Back to home */}
        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
