// Single source of truth for pricing tiers — imported by both the full
// /pricing page and the landing page's condensed teaser section, so the
// numbers and feature lists are never defined twice. Replace the Stripe
// price IDs with real ones from your Stripe dashboard's product catalog
// before going live (see references/payments.md).
export type PricingTier = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  priceIdMonthly: string;
  priceIdAnnual: string;
  highlighted: boolean;
  features: string[];
};

export const pricingTiers: PricingTier[] = [
  {
    id: "solo",
    name: "Solo",
    description: "For freelancers just getting started.",
    priceMonthly: 12,
    priceAnnual: 120,
    priceIdMonthly: "price_solo_monthly_replace_me",
    priceIdAnnual: "price_solo_annual_replace_me",
    highlighted: false,
    features: [
      "Up to 5 clients",
      "Unlimited time tracking",
      "Invoicing (5 per month)",
      "Basic reporting",
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For small teams billing multiple clients.",
    priceMonthly: 29,
    priceAnnual: 290,
    priceIdMonthly: "price_team_monthly_replace_me",
    priceIdAnnual: "price_team_annual_replace_me",
    highlighted: true,
    features: [
      "Unlimited clients",
      "Unlimited time tracking",
      "Unlimited invoicing",
      "Advanced reporting & exports",
      "Up to 5 team seats",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "For growing studios that need more control.",
    priceMonthly: 79,
    priceAnnual: 790,
    priceIdMonthly: "price_business_monthly_replace_me",
    priceIdAnnual: "price_business_annual_replace_me",
    highlighted: false,
    features: [
      "Everything in Team",
      "Unlimited team seats",
      "Custom invoice branding",
      "Priority support",
    ],
  },
];

export function annualSavings(tier: PricingTier): number {
  return tier.priceMonthly * 12 - tier.priceAnnual;
}
