import Link from "next/link";
import {
  Package,
  UtensilsCrossed,
  Users,
  Truck,
  BarChart3,
  Coffee,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Inventory",
    description: "Track ingredients, manage stock levels, and get low-stock alerts in real time.",
    href: "/inventory",
    available: true,
  },
  {
    icon: UtensilsCrossed,
    title: "Menu",
    description: "Manage menu items, variants, and recipes linked to your inventory.",
    href: "#",
    available: false,
  },
  {
    icon: Users,
    title: "Staff",
    description: "Manage your team — roles, contact info, and status.",
    href: "/staff",
    available: true,
  },
  {
    icon: Truck,
    title: "Suppliers",
    description: "Keep a vendor directory and manage purchase orders.",
    href: "#",
    available: false,
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "View inventory overview, stock movement, and staff summary.",
    href: "/reports",
    available: true,
  },
  {
    icon: ShieldCheck,
    title: "Access Control",
    description: "Role-based dashboards for owners, managers, and baristas.",
    href: "#",
    available: false,
  },
];

const stats = [
  { label: "Modules Planned", value: "6" },
  { label: "Live Modules", value: "3" },
  { label: "Built with", value: "Next.js" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Coffee className="w-5 h-5 text-amber-700" />
            <span>Coffman</span>
          </div>
          <Link
            href="/inventory"
            className="flex items-center gap-1.5 text-sm font-medium bg-amber-700 hover:bg-amber-800 text-white px-4 py-1.5 rounded-md transition-colors"
          >
            Open App <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-6">
          <TrendingUp className="w-3 h-3" />
          Coffee Shop Management — Simplified
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
          Run your coffee shop
          <br />
          <span className="text-amber-700">without the chaos</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Coffman is a back-office system for coffee shops — manage inventory, staff, menu,
          suppliers, and performance all in one place.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/inventory"
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-md font-medium transition-colors"
          >
            Go to Inventory <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 border border-border hover:bg-muted px-6 py-2.5 rounded-md font-medium transition-colors text-sm"
          >
            See all features
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-xl overflow-hidden bg-card">
          {stats.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">All modules</h2>
          <p className="text-muted-foreground mt-1">
            Everything you need to run a coffee shop — from a single dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            const card = (
              <div
                className={`group relative border rounded-xl p-6 bg-card transition-all ${
                  f.available
                    ? "border-amber-200 hover:border-amber-400 hover:shadow-md cursor-pointer"
                    : "border-border opacity-60 cursor-default"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                    f.available ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  {!f.available && (
                    <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
                      Soon
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-1">{f.description}</p>

                {f.available && (
                  <div className="mt-4 flex items-center text-sm font-medium text-amber-700 gap-1 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );

            return f.available ? (
              <Link key={f.title} href={f.href}>
                {card}
              </Link>
            ) : (
              <div key={f.title}>{card}</div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-amber-700" />
            <span className="font-medium text-foreground">Coffman</span>
            <span>— Coffee Shop Management System</span>
          </div>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
