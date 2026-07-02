import { notFound } from "next/navigation";
import { BlogEditView } from "@/components/admin/blog/BlogEditView";
import { blogApi, type BlogPostRecord } from "@/components/admin/blog/blog-admin-shared";
import { requireAdminSession } from "@/components/admin/auth/admin-session";
import { fetchAdminQuery, getAdminQueryToken } from "@/components/admin/shared/admin-live-data";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const token = await getAdminQueryToken();
  const post = await fetchAdminQuery<BlogPostRecord | null>(
    blogApi.queries.getDraftPost,
    { id },
    token
  );

  if (!post) {
    notFound();
  }

  return <BlogEditView post={post} />;
}

