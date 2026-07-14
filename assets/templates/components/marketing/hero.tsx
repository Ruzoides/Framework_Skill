import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NumericText } from "@/components/numeric-text";

const LINE_ITEMS = [
  { label: "Website redesign — 14.5 hrs", amount: 1450 },
  { label: "Brand strategy — 6 hrs", amount: 600 },
  { label: "Client review call — 1 hr", amount: 100 },
];

export function Hero() {
  const total = LINE_ITEMS.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
      <div>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          Every billable hour, accounted for.
        </h1>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">
          Ledger tracks time, manages clients, and turns hours into invoices —
          so nothing you worked on goes unbilled.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90" asChild>
            <Link href="/sign-up">Start tracking free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/#features">See how it works</Link>
          </Button>
        </div>
      </div>

      {/* The signature element: a static ledger-sheet mockup — the hero's
          thesis made concrete, not a stock illustration. */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="font-display font-semibold">Invoice #0142</span>
          <span className="text-sm text-muted-foreground">Northwind Co.</span>
        </div>
        <Separator className="my-4" />
        <ul className="space-y-3">
          {LINE_ITEMS.map((item) => (
            <li key={item.label} className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <NumericText>${item.amount.toLocaleString()}</NumericText>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex items-baseline justify-between">
          <span className="font-display font-semibold">Total due</span>
          <NumericText className="text-xl font-semibold">
            ${total.toLocaleString()}
          </NumericText>
        </div>
      </div>
    </section>
  );
}
