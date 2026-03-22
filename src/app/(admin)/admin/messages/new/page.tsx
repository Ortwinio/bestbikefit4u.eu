import { MessageComposeView } from "@/components/admin/messages/MessageViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminNewMessagePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="New message"
        description="Draft, target, preview, and schedule a dashboard message."
      />
      <MessageComposeView />
    </div>
  );
}
