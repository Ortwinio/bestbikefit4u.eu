import { BillingEventsView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminBillingEventsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="Billing events"
        description="A live Convex feed of plan changes, lifecycle updates, and billing payloads."
      />
      <BillingEventsView />
    </div>
  );
}
