"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NumericText } from "@/components/numeric-text";
import { pricingTiers, annualSavings } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  async function subscribe(priceId: string, tierId: string) {
    setLoadingTier(tierId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Every plan tracks time and invoices clients. Pick the one that matches how you work.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Label htmlFor="billing-toggle" className={cn(!annual && "text-foreground", annual && "text-muted-foreground")}>
          Monthly
        </Label>
        <Switch id="billing-toggle" checked={annual} onCheckedChange={setAnnual} />
        <Label htmlFor="billing-toggle" className={cn(annual && "text-foreground", !annual && "text-muted-foreground")}>
          Annual
        </Label>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pricingTiers.map((tier) => {
          const price = annual ? tier.priceAnnual : tier.priceMonthly;
          const savings = annualSavings(tier);
          return (
            <Card
              key={tier.id}
              className={cn(
                "relative flex flex-col",
                tier.highlighted && "border-gold shadow-lg md:-translate-y-2"
              )}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <h2 className="font-display text-xl font-semibold">{tier.name}</h2>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <NumericText className="text-4xl font-semibold">${price}</NumericText>
                    <span className="text-muted-foreground">/{annual ? "year" : "month"}</span>
                  </div>
                  {annual && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Save <NumericText>${savings}</NumericText> a year
                    </p>
                  )}
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                  disabled={loadingTier === tier.id}
                  onClick={() =>
                    subscribe(annual ? tier.priceIdAnnual : tier.priceIdMonthly, tier.id)
                  }
                >
                  {loadingTier === tier.id ? "Redirecting..." : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
