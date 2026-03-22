import { FeedbackDetailView } from "@/components/admin/feedback/FeedbackViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default async function AdminFeedbackDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Feedback"
        title="Feedback detail"
        description="Item-level triage, assignment, release linking, and user reply handling."
      />
      <FeedbackDetailView itemId={itemId} />
    </div>
  );
}
