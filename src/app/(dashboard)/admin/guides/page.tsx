import { GuidesAdminListClient } from "@/components/admin/guides/GuidesAdminListClient";
import { requireAdminSession } from "@/components/admin/auth/admin-session";
import { isGuideAdminRole } from "@/components/admin/guides/guide-admin-shared";

export default async function AdminGuidesPage() {
  const session = await requireAdminSession();

  return <GuidesAdminListClient canManageRedirects={isGuideAdminRole(session.adminRole)} />;
}
