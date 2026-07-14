import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Legal links are placeholders — wire these up to real Privacy/Terms pages
// before launch.
const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="font-display text-lg font-bold">Ledger</span>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Time, invoicing, and clients — tracked precisely.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h4 className="text-sm font-semibold">{column.heading}</h4>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Ledger. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
