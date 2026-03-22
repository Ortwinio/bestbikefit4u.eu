import { BillingCatalogView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminLicensesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="License catalog"
        description="Live billing plan definitions, pricing contracts, and read-only blockers for roles without mutation access."
      />
      <BillingCatalogView />
    </div>
  );
}
