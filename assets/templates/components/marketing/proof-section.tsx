import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NumericText } from "@/components/numeric-text";

// Placeholder figures and quotes — replace with your own real numbers and
// customer testimonials before launch.
const STATS = [
  { value: "2,400+", label: "freelancers and teams" },
  { value: "$18M+", label: "invoiced through Ledger" },
  { value: "94%", label: "send their first invoice within a day" },
];

const TESTIMONIALS = [
  {
    quote: "I stopped losing billable hours to memory. Everything I track shows up on the next invoice automatically.",
    name: "Priya Nair",
    role: "Independent brand designer",
  },
  {
    quote: "Switching clients between projects used to be a mess of spreadsheets. Now it's just Ledger.",
    name: "Marcus Webb",
    role: "Founder, Bramble Collective",
  },
];

export function ProofSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Separator />
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <NumericText className="text-3xl font-semibold md:text-4xl">
              {stat.value}
            </NumericText>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.name}>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Separator className="mt-12" />
    </section>
  );
}
