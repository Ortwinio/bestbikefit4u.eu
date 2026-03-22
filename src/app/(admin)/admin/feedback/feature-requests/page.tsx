import { FeatureRequestsBoardView } from "@/components/admin/feedback/FeedbackViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminFeatureRequestsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Feedback"
        title="Feature requests"
        description="Grouped planning board for higher-level requests and merge-deduplication triage."
      />
      <FeatureRequestsBoardView />
    </div>
  );
}
