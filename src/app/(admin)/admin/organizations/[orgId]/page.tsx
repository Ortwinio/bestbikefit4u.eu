import { notFound } from "next/navigation";
import { OrganizationDetailClient } from "@/components/admin/organizations/OrganizationDetailClient";
import { adminOrganizationDetails } from "@/components/admin/organizations/admin-organizations-data";

type PageProps = {
  params: Promise<{
    orgId: string;
  }>;
};

export default async function AdminOrganizationDetailPage({ params }: PageProps) {
  const { orgId } = await params;
  const organization = adminOrganizationDetails[orgId];

  if (!organization) {
    notFound();
  }

  return <OrganizationDetailClient organization={organization} />;
}
