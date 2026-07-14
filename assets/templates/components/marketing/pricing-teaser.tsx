import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumericText } from "@/components/numeric-text";
import { pricingTiers } from "@/lib/pricing-data";

export function PricingTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Pricing that scales with you</h2>
        <p className="mt-3 text-muted-foreground">Start solo, add teammates when you need to.</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.id}
            className={tier.highlighted ? "relative border-gold shadow-lg md:-translate-y-2" : "relative"}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground">
                Most popular
              </Badge>
            )}
            <CardHeader>
              <h3 className="font-display text-lg font-semibold">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <NumericText className="text-3xl font-semibold">
                  ${tier.priceMonthly}
                </NumericText>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {tier.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant={tier.highlighted ? "default" : "outline"} className="w-full" asChild>
                <Link href="/pricing">See full plan</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
