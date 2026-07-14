import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    // bg-foreground/text-background deliberately inverts the page's normal
    // relationship — ink-on-paper everywhere else, paper-on-ink here — so
    // this reskins automatically with the tokens in app/globals.css instead
    // of needing its own hardcoded colors.
    <section className="bg-foreground py-20 text-background">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-3xl font-bold">Start billing every hour you work</h2>
        <p className="mt-3 text-background/70">
          Free for your first 5 clients. No credit card required to start.
        </p>
        <Button size="lg" className="mt-8 bg-gold text-gold-foreground hover:bg-gold/90" asChild>
          <Link href="/sign-up">Start tracking free</Link>
        </Button>
      </div>
    </section>
  );
}
