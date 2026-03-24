import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/components/admin/auth/admin-session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
