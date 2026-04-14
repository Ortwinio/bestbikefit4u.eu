import { GuideImportView } from "@/components/admin/guides/GuideImportView";
import { requireAdminSession } from "@/components/admin/auth/admin-session";

export default async function AdminGuideImportPage() {
  await requireAdminSession();

  return <GuideImportView />;
}
