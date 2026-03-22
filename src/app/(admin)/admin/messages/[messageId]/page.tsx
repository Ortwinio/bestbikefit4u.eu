import { use } from "react";
import { MessageDetailView } from "@/components/admin/messages/MessageViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = use(params);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="Message detail"
        description="Delivery stats, audience shape, and status controls for a dashboard message."
      />
      <MessageDetailView messageId={messageId} />
    </div>
  );
}
