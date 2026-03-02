"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coffee, Loader2 } from "lucide-react";

type TokenInfo = {
  status: string;
  email: string;
  billingCycle: string;
};

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [shopName, setShopName] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenError("No setup token found. Please complete payment first.");
      return;
    }

    fetch(`/api/auth/pending-registration?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setTokenError(data.error ?? "Invalid or expired link.");
          return;
        }
        const data = await res.json();
        if (data.status !== "PAID") {
          setTokenError("Payment not yet confirmed. Please wait a moment and refresh.");
          return;
        }
        setTokenInfo(data);
      })
      .catch(() => setTokenError("Network error. Please try again."));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, shopName, name, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.replace(data.redirect ?? "/inventory");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!tokenInfo && !tokenError) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
        <p className="text-sm text-muted-foreground">Verifying your payment…</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-destructive">{tokenError}</p>
        <a href="/#pricing" className="text-sm text-amber-700 hover:underline">
          Back to pricing
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900">
        Payment confirmed for <span className="font-medium">{tokenInfo!.email}</span>
      </div>

      <div>
        <label htmlFor="shopName" className="block text-sm font-medium text-foreground mb-1.5">
          Coffee shop name
        </label>
        <input
          id="shopName"
          type="text"
          required
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="My Coffee House"
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
          Your name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ahmad Razif"
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
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
            Setting up your shop…
          </>
        ) : (
          "Create my shop"
        )}
      </button>
    </form>
  );
}

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold">Set up your shop</h1>
          <p className="text-sm text-muted-foreground text-center">
            Payment confirmed. Now create your shop and owner account.
          </p>
        </div>
        <Suspense>
          <SetupForm />
        </Suspense>
      </div>
    </div>
  );
}
