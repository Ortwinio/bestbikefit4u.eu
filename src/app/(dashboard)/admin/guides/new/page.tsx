import { GuideCreateView } from "@/components/admin/guides/GuideCreateView";
import { requireAdminSession } from "@/components/admin/auth/admin-session";

export default async function AdminGuideCreatePage() {
  const session = await requireAdminSession();

  return <GuideCreateView sessionRole={session.adminRole} />;
}

