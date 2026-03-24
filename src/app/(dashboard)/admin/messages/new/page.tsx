import { MessageComposeView } from "@/components/admin/messages/MessageViews";
import { loadMessageComposeData } from "@/components/admin/messages/message-data";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default async function AdminNewMessagePage() {
  const data = await loadMessageComposeData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="New message"
        description="Draft, target, preview, and schedule a dashboard message."
      />
      <MessageComposeView data={data} mode="create" />
    </div>
  );
}
