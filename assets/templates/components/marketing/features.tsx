import { Clock, FileText, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const FEATURES = [
  {
    icon: Clock,
    title: "Time tracking",
    description: "Start and stop timers per project, or log hours after the fact — down to the minute.",
  },
  {
    icon: FileText,
    title: "Invoicing",
    description: "Turn tracked hours into a professional invoice in one click, sent straight to your client.",
  },
  {
    icon: Users,
    title: "Client management",
    description: "Keep contacts, projects, and billing rates organized per client, not scattered across spreadsheets.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    description: "See where your time actually goes, and export summaries for taxes or client reviews.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-3xl font-bold">Everything billable, in one place</h2>
      <Separator className="mt-6" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="border-none shadow-none bg-transparent">
            <CardHeader>
              <feature.icon className="size-6 text-gold" />
            </CardHeader>
            <CardContent className="space-y-2">
              <h3 className="font-display font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
