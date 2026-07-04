"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { AccessibleDialog, Button, useToast } from "@/components/ui";
import { GuideBodyMarkdown } from "@/components/content/GuideBodyMarkdown";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import {
  blogApi,
  blogStatusTone,
  buildBlogPreviewPath,
  formatBlogDateTime,
  formatBlogStatus,
  type BlogPostRecord,
  type BlogStatus,
} from "./blog-admin-shared";

export function BlogDetailView({ post }: { post: BlogPostRecord }) {
  const router = useRouter();
  const toast = useToast();
  const publishPost = useMutation(blogApi.mutations.publishPost);
  const unpublishPost = useMutation(blogApi.mutations.unpublishPost);
  const deletePost = useMutation(blogApi.mutations.deletePost);
  const [status, setStatus] = useState<BlogStatus>(post.status);
  const [isMutating, setIsMutating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewPath = buildBlogPreviewPath(post.slug);

  const handlePublishState = async (nextStatus: BlogStatus) => {
    setError(null);
    setIsMutating(true);
    try {
      if (nextStatus === "published") {
        await publishPost({ id: post._id });
        setStatus("published");
        toast.success({ description: "Blog post published." });
      } else {
        await unpublishPost({ id: post._id });
        setStatus("draft");
        toast.success({ description: "Blog post unpublished." });
      }
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to update blog publishing state:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not update publishing state."
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsMutating(true);
    try {
      await deletePost({ id: post._id });
      toast.success({ description: "Blog draft deleted." });
      router.push("/admin/blog");
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to delete blog post:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not delete the blog post."
      );
    } finally {
      setIsMutating(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <AccessibleDialog
        open={deleteOpen}
        title="Delete blog draft"
        description={`Delete ${post.title.en || post.slug}? Published posts must be unpublished first.`}
        onClose={() => setDeleteOpen(false)}
      >
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button type="button" isLoading={isMutating} onClick={() => void handleDelete()}>
            Delete
          </Button>
        </div>
      </AccessibleDialog>

      <AdminPageHeader
        eyebrow="Product / Blog"
        title={post.title.en || post.slug}
        description={previewPath}
        actions={
          <>
            <AdminStatusPill tone={blogStatusTone(status)}>{formatBlogStatus(status)}</AdminStatusPill>
            <Button variant="outline" render={<Link href={`/admin/blog/${post._id}/edit`} />}>
              Edit
            </Button>
            <Button variant="outline" render={<Link href="/admin/blog" />}>
              Back to blog
            </Button>
            {status === "published" ? (
              <Button type="button" isLoading={isMutating} onClick={() => void handlePublishState("draft")}>
                Unpublish
              </Button>
            ) : (
              <Button type="button" isLoading={isMutating} onClick={() => void handlePublishState("published")}>
                Publish
              </Button>
            )}
          </>
        }
      />

      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.7fr)]">
        <AdminSectionCard title="Preview" description="English article body preview rendered from Markdown.">
          <article className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">{post.category}</p>
              <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {post.h1?.en || post.title.en}
              </h2>
              {post.excerpt?.en ? (
                <p className="text-base leading-7 text-[color:var(--muted-foreground)]">{post.excerpt.en}</p>
              ) : null}
            </div>
            {post.body.en.trim() ? (
              <GuideBodyMarkdown content={post.body.en} />
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">No English body content yet.</p>
            )}
          </article>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard title="Key fields" description="Current routing, SEO, and publishing state.">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-[color:var(--foreground)]">Slug</dt>
                <dd className="text-[color:var(--muted-foreground)]">{post.slug}</dd>
              </div>
              <div>
                <dt className="font-medium text-[color:var(--foreground)]">Meta title EN</dt>
                <dd className="text-[color:var(--muted-foreground)]">{post.metaTitle.en || "Not set"}</dd>
              </div>
              <div>
                <dt className="font-medium text-[color:var(--foreground)]">Meta description EN</dt>
                <dd className="text-[color:var(--muted-foreground)]">{post.metaDescription.en || "Not set"}</dd>
              </div>
              <div>
                <dt className="font-medium text-[color:var(--foreground)]">Published at</dt>
                <dd className="text-[color:var(--muted-foreground)]">{formatBlogDateTime(post.publishedAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[color:var(--foreground)]">Updated at</dt>
                <dd className="text-[color:var(--muted-foreground)]">{formatBlogDateTime(post.updatedAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[color:var(--foreground)]">Version</dt>
                <dd className="text-[color:var(--muted-foreground)]">{post.version}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Button type="button" variant="ghost" disabled={status === "published"} onClick={() => setDeleteOpen(true)}>
                Delete draft
              </Button>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
