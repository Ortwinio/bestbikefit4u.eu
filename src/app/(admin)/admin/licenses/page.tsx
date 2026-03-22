import { BillingCatalogView } from "@/components/admin/billing/BillingViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminLicensesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Billing"
        title="License catalog"
        description="Plan definitions, entitlement flags, and plan management in the shared Prototyper UI surface."
      />
      <BillingCatalogView />
    </div>
  );
}
