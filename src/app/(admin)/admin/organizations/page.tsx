import { OrganizationsAdminClient } from "@/components/admin/organizations/OrganizationsAdminClient";
import { adminOrganizations } from "@/components/admin/organizations/admin-organizations-data";

export default function AdminOrganizationsPage() {
  return <OrganizationsAdminClient organizations={adminOrganizations} />;
}

