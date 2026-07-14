"use client";

import { useState } from "react";

// Replace with your real Stripe Price IDs (Stripe dashboard -> Product catalog).
const PLANS = [
  { name: "Pro", priceId: "price_replace_me", price: "$19/mo" },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function subscribe(priceId: string) {
    setLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <div className="mt-8 space-y-4">
        {PLANS.map((plan) => (
          <div key={plan.priceId} className="rounded-md border p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">{plan.name}</div>
              <div className="text-gray-600">{plan.price}</div>
            </div>
            <button
              onClick={() => subscribe(plan.priceId)}
              disabled={loading === plan.priceId}
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading === plan.priceId ? "Redirecting..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
