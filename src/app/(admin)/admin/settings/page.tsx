import { SettingsManagementView } from "@/components/admin/settings/SettingsViews";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Settings"
        title="System settings"
        description="Admin roles, feature flags, GDPR tooling, and system information."
      />
      <SettingsManagementView />
    </div>
  );
}
