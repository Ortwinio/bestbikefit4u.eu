import { use } from "react";
import { MessageComposeView } from "@/components/admin/messages/MessageViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminEditMessagePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = use(params);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="Edit message"
        description={`Update the draft message ${messageId} using the shared Prototyper UI contract.`}
      />
      <MessageComposeView />
    </div>
  );
}
