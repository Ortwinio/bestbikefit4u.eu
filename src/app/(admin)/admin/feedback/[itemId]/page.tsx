import { FeedbackDetailView } from "@/components/admin/feedback/FeedbackViews";
import { loadFeedbackDetailData } from "@/components/admin/feedback/feedback-data";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";
import { Button, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function AdminFeedbackDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const data = await loadFeedbackDetailData(itemId);
  if (!data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Feedback"
          title="Feedback detail"
          description="Item-level triage, assignment, release linking, and user reply handling."
        />
        <EmptyState
          title="Feedback item not found"
          description="The live Convex record is no longer available."
          action={
            <Button render={<Link href="/admin/feedback" />}>Back to inbox</Button>
          }
        />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Feedback"
        title="Feedback detail"
        description="Item-level triage, assignment, release linking, and user reply handling."
      />
      <FeedbackDetailView data={data} />
    </div>
  );
}
