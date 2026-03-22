import { MessageComposeView } from "@/components/admin/messages/MessageViews";
import { loadMessageComposeData } from "@/components/admin/messages/message-data";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";
import { Button, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function AdminEditMessagePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;
  const data = await loadMessageComposeData(messageId);

  if (!data || !data.detail) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Messages"
          title="Edit message"
          description={`Update the draft message ${messageId} using the shared Prototyper UI contract.`}
        />
        <EmptyState
          title="Message not found"
          description="The draft is no longer available in Convex."
          action={<Button render={<Link href="/admin/messages" />}>Back to inbox</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="Edit message"
        description={`Update the draft message ${messageId} using the shared Prototyper UI contract.`}
      />
      <MessageComposeView data={data} mode="edit" />
    </div>
  );
}
