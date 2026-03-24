import { PlanFormView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminNewPlanPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="Create plan"
        description="Create a live billing plan in Convex using the shared Prototyper UI form surface."
      />
      <PlanFormView mode="new" />
    </div>
  );
}
