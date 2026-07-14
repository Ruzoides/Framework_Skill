import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-semibold">Your Site</span>
        <nav className="flex gap-4 text-sm">
          <a href="/pricing">Pricing</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t px-6 py-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Your Site
      </footer>
    </div>
  );
}
