"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coffee, Loader2 } from "lucide-react";

function SubscribeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const plan = searchParams.get("plan") ?? "ANNUAL";
    const billingCycle = plan === "MONTHLY" ? "MONTHLY" : "ANNUAL";

    fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billingCycle }),
    })
      .then(async (res) => {
        if (res.status === 401) {
          // Not logged in — send to login and come back here after
          router.replace(`/login?from=/subscribe?plan=${billingCycle}`);
          return;
        }
        if (res.status === 409) {
          // Already subscribed
          router.replace("/inventory?subscribed=1");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }
        const { paymentUrl } = await res.json();
        window.location.href = paymentUrl;
      })
      .catch(() => setError("Network error. Please try again."));
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => router.push("/#pricing")}
          className="text-sm font-medium text-amber-700 hover:underline"
        >
          Back to pricing
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
      <p className="text-sm text-muted-foreground">Setting up your subscription...</p>
    </div>
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
          <h1 className="text-xl font-semibold">Coffman</h1>
        </div>
        <Suspense>
          <SubscribeFlow />
        </Suspense>
      </div>
    </div>
  );
}
