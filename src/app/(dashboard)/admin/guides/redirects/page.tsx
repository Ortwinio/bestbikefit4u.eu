import type { Doc } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { GuideRedirectsView } from "@/components/admin/guides/GuideRedirectsView";
import { requireAdminSession } from "@/components/admin/auth/admin-session";
import {
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "@/components/admin/shared/admin-live-data";

export default async function AdminGuideRedirectsPage() {
  await requireAdminSession();
  const token = await getAdminQueryToken();
  const [redirects, users] = await Promise.all([
    fetchAdminQuery<Doc<"redirects">[]>(
      api.guides.queries.listRedirects,
      {},
      token
    ),
    fetchAdminUsers(token),
  ]);

  const createdByLabels = Object.fromEntries(
    users.map((user) => [
      String(user._id),
      user.displayName ?? user.name ?? user.email ?? "Admin",
    ])
  );

  return (
    <GuideRedirectsView
      redirects={redirects}
      createdByLabels={createdByLabels}
    />
  );
}
