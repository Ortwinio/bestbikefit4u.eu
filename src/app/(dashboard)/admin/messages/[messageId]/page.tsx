import { MessageDetailView } from "@/components/admin/messages/MessageViews";
import { loadMessageDetailData } from "@/components/admin/messages/message-data";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";
import { Button, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;
  const data = await loadMessageDetailData(messageId);

  if (!data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Messages"
          title="Message detail"
          description="Delivery stats, audience shape, and status controls for a dashboard message."
        />
        <EmptyState
          title="Message not found"
          description="The live Convex record is no longer available."
          action={<Button render={<Link href="/admin/messages" />}>Back to inbox</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="Message detail"
        description="Delivery stats, audience shape, and status controls for a dashboard message."
      />
      <MessageDetailView data={data} />
    </div>
  );
}
