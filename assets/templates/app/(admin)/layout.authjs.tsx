import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserMenuAuthjs } from "@/components/admin/user-menu-authjs";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <AdminShell
      userMenu={<UserMenuAuthjs name={session.user.name} email={session.user.email} />}
    >
      {children}
    </AdminShell>
  );
}
