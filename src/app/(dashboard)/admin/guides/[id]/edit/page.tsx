import { notFound } from "next/navigation";
import type { Doc, Id } from "../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../convex/_generated/api";
import { GuideEditView } from "@/components/admin/guides/GuideEditView";
import { requireAdminSession } from "@/components/admin/auth/admin-session";
import { fetchAdminQuery, getAdminQueryToken } from "@/components/admin/shared/admin-live-data";

export default async function AdminGuideEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  const { id } = await params;
  const token = await getAdminQueryToken();
  const guide = await fetchAdminQuery<Doc<"guidePages"> | null>(
    api.guides.queries.getDraftGuide,
    { id: id as Id<"guidePages"> },
    token
  );

  if (!guide) {
    notFound();
  }

  return (
    <GuideEditView
      guide={guide}
      sessionRole={session.adminRole}
    />
  );
}
