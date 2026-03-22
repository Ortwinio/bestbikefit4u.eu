import { OrganizationDetailClient } from "@/components/admin/organizations/OrganizationDetailClient";

type PageProps = {
  params: Promise<{
    orgId: string;
  }>;
};

export default async function AdminOrganizationDetailPage({ params }: PageProps) {
  const { orgId } = await params;
  return <OrganizationDetailClient orgId={orgId} />;
}
