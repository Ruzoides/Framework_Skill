// Placeholder wordmarks, not real logos — replace with actual customer logos
// (with their permission) before launch.
const PLACEHOLDER_CUSTOMERS = [
  "Northwind Co.",
  "Studio Nine",
  "Harbor & Finch",
  "Bramble Collective",
  "Fieldnote",
];

export function LogoStrip() {
  return (
    <section className="border-y border-border bg-secondary/40 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Trusted by freelancers and small teams at
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PLACEHOLDER_CUSTOMERS.map((name) => (
            <span
              key={name}
              className="font-display text-sm font-semibold text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
