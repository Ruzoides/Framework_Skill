import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders any number-bearing content (stats, prices, table figures) in the
 * monospace type role with tabular figures, so columns of numbers stay
 * aligned. This is the one deliberate typographic signature of the product:
 * numbers are never set in the body typeface. See references/design.md.
 */
export function NumericText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-figures", className)}>
      {children}
    </span>
  );
}
