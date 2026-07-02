import { BlogCreateView } from "@/components/admin/blog/BlogCreateView";
import { requireAdminSession } from "@/components/admin/auth/admin-session";

export default async function AdminBlogCreatePage() {
  const session = await requireAdminSession();

  return <BlogCreateView sessionRole={session.adminRole} />;
}

