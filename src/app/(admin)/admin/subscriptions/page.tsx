import { SubscriptionsView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="Subscriptions"
        description="User plan assignments, trial state, and quick plan-change workflows."
      />
      <SubscriptionsView />
    </div>
  );
}
