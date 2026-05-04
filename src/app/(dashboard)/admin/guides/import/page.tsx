import { GuideImportView } from "@/components/admin/guides/GuideImportView";
import { requireAdminSession } from "@/components/admin/auth/admin-session";
import { isGuideAdminRole } from "@/components/admin/guides/guide-admin-shared";
import { redirect } from "next/navigation";

export default async function AdminGuideImportPage() {
  const session = await requireAdminSession();
  if (!isGuideAdminRole(session.adminRole)) {
    redirect("/admin/guides");
  }

  return <GuideImportView />;
}
