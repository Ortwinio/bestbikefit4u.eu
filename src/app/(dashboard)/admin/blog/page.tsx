import { BlogAdminListClient } from "@/components/admin/blog/BlogAdminListClient";
import { requireAdminSession } from "@/components/admin/auth/admin-session";

export default async function AdminBlogPage() {
  await requireAdminSession();

  return <BlogAdminListClient />;
}

