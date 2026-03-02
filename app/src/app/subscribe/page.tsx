"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Coffee, Loader2 } from "lucide-react";
import Link from "next/link";

const PLAN_LABELS = {
  ANNUAL: { price: "RM 79/month", billed: "billed annually (RM 948/year)", save: true },
  MONTHLY: { price: "RM 90/month", billed: "billed monthly", save: false },
};

function SubscribeForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") === "MONTHLY" ? "MONTHLY" : "ANNUAL";
  const planInfo = PLAN_LABELS[plan];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/pending-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, billingCycle: plan }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Plan summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
        <div className="font-semibold text-amber-900">{plan === "ANNUAL" ? "Annual Plan" : "Monthly Plan"}</div>
        <div className="text-amber-800 mt-0.5">{planInfo.price}</div>
        <div className="text-amber-700 text-xs mt-0.5">{planInfo.billed}</div>
        {planInfo.save && (
          <div className="text-xs font-medium text-amber-700 mt-1">Save 12% vs monthly</div>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          Your email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@mycoffeeshop.com"
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <p className="text-xs text-muted-foreground mt-1">
          We&apos;ll send the payment invoice to this address.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Preparing payment…
          </>
        ) : (
          "Proceed to payment"
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-amber-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold">Start your subscription</h1>
          <p className="text-sm text-muted-foreground text-center">
            Pay first, then set up your shop and account.
          </p>
        </div>
        <Suspense>
          <SubscribeForm />
        </Suspense>
      </div>
    </div>
  );
}
