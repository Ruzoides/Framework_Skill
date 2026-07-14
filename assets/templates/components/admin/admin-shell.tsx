"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Auth-agnostic admin shell (sidebar + topbar). Both layout.clerk.tsx and
 * layout.authjs.tsx render this after their own auth check, passing in a
 * userMenu appropriate to the auth provider — this component knows nothing
 * about Clerk or Auth.js.
 */
export function AdminShell({
  children,
  userMenu,
}: {
  children: ReactNode;
  userMenu: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border p-4 md:flex">
        <Link href="/dashboard" className="font-display text-lg font-bold">
          Ledger
        </Link>
        <Separator className="my-4" />
        <AdminNav />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu />
          </Button>
          <div />
          {userMenu}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="font-display">Ledger</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <AdminNav />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
