import { FeatureRequestsBoardView } from "@/components/admin/feedback/FeedbackViews";
import { loadFeedbackInboxData } from "@/components/admin/feedback/feedback-data";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminFeatureRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = getSearchParam(resolvedSearchParams.status) ?? "all";
  const data = await loadFeedbackInboxData({
    type: "feature_request",
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Feedback"
        title="Feature requests"
        description="Grouped planning board for higher-level requests and merge-deduplication triage."
      />
      <FeatureRequestsBoardView rows={data.items} status={status} />
    </div>
  );
}
