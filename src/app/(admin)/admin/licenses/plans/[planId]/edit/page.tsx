import { use } from "react";
import { PlanFormView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminEditPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="Edit plan"
        description="Update a live Convex billing plan, or review the read-only blocker when the role cannot mutate plans."
      />
      <PlanFormView mode="edit" planId={planId} />
    </div>
  );
}
