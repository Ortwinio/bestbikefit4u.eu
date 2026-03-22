import { PlanFormView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminNewPlanPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="Create plan"
        description="Build a new contract-shaped plan record using the shared Prototyper UI form surface."
      />
      <PlanFormView mode="new" />
    </div>
  );
}
