import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { getCurrentAdminSession } from "@/components/admin/auth/admin-session";
import { ADMIN_PATHNAME_HEADER } from "@/components/admin/auth/admin-request";
import { canAccessAdminRoute } from "@/components/admin/auth/admin-route-access";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const pathname = (await headers()).get(ADMIN_PATHNAME_HEADER) ?? "/admin/overview";
  if (!canAccessAdminRoute(pathname, session.adminRole)) {
    redirect("/admin/overview");
  }

  return <AdminShell user={session}>{children}</AdminShell>;
}
