import { MessageListView } from "@/components/admin/messages/MessageViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="Dashboard messages"
        description="Compose and review dashboard messaging in the shared Prototyper UI contract."
      />
      <MessageListView />
    </div>
  );
}
