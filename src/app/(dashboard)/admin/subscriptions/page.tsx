import { SubscriptionsView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="Subscriptions"
        description="Live subscription assignments, lifecycle actions, and read-only blockers for non-mutation roles."
      />
      <SubscriptionsView />
    </div>
  );
}
