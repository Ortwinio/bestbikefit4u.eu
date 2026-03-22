import { FeedbackInboxView } from "@/components/admin/feedback/FeedbackViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminFeedbackPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Feedback"
        title="Feedback inbox"
        description="Triage bugs, feature requests, fit-quality concerns, and support cases in the shared Prototyper UI surface."
      />
      <FeedbackInboxView />
    </div>
  );
}
