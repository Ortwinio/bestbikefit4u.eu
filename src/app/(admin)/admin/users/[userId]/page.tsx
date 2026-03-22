import { notFound } from "next/navigation";
import { UserDetailClient } from "@/components/admin/users/UserDetailClient";
import { adminUserDetails } from "@/components/admin/users/admin-users-data";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const user = adminUserDetails[userId];

  if (!user) {
    notFound();
  }

  return <UserDetailClient user={user} />;
}
