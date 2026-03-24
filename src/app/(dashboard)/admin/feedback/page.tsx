import { FeedbackInboxView } from "@/components/admin/feedback/FeedbackViews";
import { loadFeedbackInboxData } from "@/components/admin/feedback/feedback-data";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const type = getSearchParam(resolvedSearchParams.type) ?? "all";
  const status = getSearchParam(resolvedSearchParams.status) ?? "all";
  const data = await loadFeedbackInboxData({
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Feedback"
        title="Feedback inbox"
        description="Triage bugs, feature requests, fit-quality concerns, and support cases in the shared Prototyper UI surface."
      />
      <FeedbackInboxView rows={data.items} filters={{ type, status }} />
    </div>
  );
}
