"use client";

import Link from "next/link";
import { useState } from "react";
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
  Check,
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
    description: "Manage menu items, set prices, and link recipes to ingredients.",
    href: "/menu",
    available: true,
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
    icon: TrendingUp,
    title: "Sales",
    description: "Record daily sales, track monthly revenue, and see top products — no Excel needed.",
    href: "/sales",
    available: true,
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Monthly revenue, top products, payment breakdown, inventory, and staff summary.",
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
  { label: "Live Modules", value: "5" },
  { label: "Built with", value: "Next.js" },
];

const PLAN_FEATURES = [
  "Inventory & stock tracking",
  "Menu & recipe management",
  "Sales recording & POS",
  "Staff management",
  "Analytics & reports",
  "Role-based access control",
];

function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const monthly = { price: 90, label: "RM 90", cycle: "/ month", href: "/subscribe?plan=MONTHLY" };
  const annualPlan = { price: 79, label: "RM 79", cycle: "/ month, billed annually", href: "/subscribe?plan=ANNUAL" };
  const active = annual ? annualPlan : monthly;
  const other = annual ? monthly : annualPlan;

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 pb-24">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-foreground">Simple, transparent pricing</h2>
        <p className="text-muted-foreground mt-1">One plan, all features included.</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 mt-6 bg-muted rounded-lg p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              !annual ? "bg-background shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              annual ? "bg-background shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual
            <span className="ml-1.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
              Save 12%
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Highlighted / active plan */}
        <div className="border-2 border-amber-400 rounded-xl p-6 bg-amber-50 relative flex flex-col">
          {annual && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold bg-amber-700 text-white px-3 py-0.5 rounded-full">
              Best value
            </div>
          )}
          <div className="text-sm font-medium text-amber-800 mb-2">
            {annual ? "Annual" : "Monthly"}
          </div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-bold text-foreground">{active.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">{active.cycle}</p>
          <ul className="space-y-2 mb-8 flex-1">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-amber-700 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={active.href}
            className="block text-center bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Other plan */}
        <div className="border border-border rounded-xl p-6 bg-card flex flex-col">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            {annual ? "Monthly" : "Annual"}
          </div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-bold text-foreground">{other.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">{other.cycle}</p>
          <ul className="space-y-2 mb-8 flex-1">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={other.href}
            className="block text-center border border-border hover:bg-muted px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

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
          <div className="flex items-center gap-3">
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link
              href="/inventory"
              className="flex items-center gap-1.5 text-sm font-medium bg-amber-700 hover:bg-amber-800 text-white px-4 py-1.5 rounded-md transition-colors"
            >
              Open App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
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

      {/* Pricing */}
      <PricingSection />

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
