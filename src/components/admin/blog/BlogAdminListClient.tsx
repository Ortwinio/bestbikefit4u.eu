"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Button, EmptyState, LoadingState, SegmentedControl, SegmentedControlItem } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
} from "@/components/admin/layout/AdminUi";
import {
  BLOG_STATUS_OPTIONS,
  blogApi,
  blogStatusTone,
  formatBlogDate,
  formatBlogStatus,
  type BlogPostRecord,
  type BlogStatus,
} from "./blog-admin-shared";

type StatusFilter = "all" | BlogStatus;

export function BlogAdminListClient() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const queryArgs = useMemo(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [statusFilter]
  );
  const results = useQuery(
    blogApi.queries.listAllPosts,
    queryArgs
  );
  const posts = (results ?? []) as BlogPostRecord[];

  if (results === undefined) {
    return <LoadingState label="Loading blog posts..." />;
  }

  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Product"
        title="Blog"
        description="Manage long-form blog articles, SEO fields, publishing state, and revision history."
        actions={<Button render={<Link href="/admin/blog/new" />}>New post</Button>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Loaded posts" value={posts.length} description="Current rows loaded from Convex" />
        <AdminMetricCard label="Published" value={publishedCount} description="Live blog articles" />
        <AdminMetricCard label="Drafts" value={draftCount} description="Posts not visible publicly" />
      </section>

      <AdminSectionCard title="Filters" description="Filter the blog library by publishing state.">
        <SegmentedControl
          aria-label="Blog status filter"
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          size="sm"
        >
          {BLOG_STATUS_OPTIONS.map((option) => (
            <SegmentedControlItem key={option.value} value={option.value}>
              {option.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </AdminSectionCard>

      <AdminSectionCard title="Posts" description="Click a row for preview and publishing actions, or jump straight into editing.">
        {posts.length === 0 ? (
          <EmptyState
            title="No blog posts found"
            description="No blog records matched the current filter."
          />
        ) : (
          <AdminTable>
            <AdminTableHead columns={["Title", "Category", "Status", "Published", "Last edited", "Actions"]} />
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post._id}
                  className="cursor-pointer border-t border-[color:var(--border)] transition-colors hover:bg-[color:var(--secondary)]/45"
                  onClick={() => router.push(`/admin/blog/${post._id}`)}
                >
                  <AdminTableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{post.title.en || post.slug}</div>
                      <code className="text-xs text-[color:var(--muted-foreground)]">{post.slug}</code>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>{post.category}</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={blogStatusTone(post.status)}>
                      {formatBlogStatus(post.status)}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{formatBlogDate(post.publishedAt)}</AdminTableCell>
                  <AdminTableCell>{formatBlogDate(post.updatedAt)}</AdminTableCell>
                  <AdminTableCell>
                    <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                      <Button
                        render={<Link href={`/admin/blog/${post._id}/edit`} />}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        render={<Link href={`/admin/blog/${post._id}`} />}
                        variant="ghost"
                        size="sm"
                      >
                        Preview
                      </Button>
                    </div>
                  </AdminTableCell>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}

      </AdminSectionCard>
    </div>
  );
}
