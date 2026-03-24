import { UserDetailClient } from "@/components/admin/users/UserDetailClient";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { userId } = await params;
  return <UserDetailClient userId={userId} />;
}
