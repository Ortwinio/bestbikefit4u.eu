"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { PaginatedQueryItem } from "convex/react";
import { AccessibleDialog, Button, EmptyState, Input, LoadingState, Select, useToast } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import {
  formatGuideDate,
  formatGuideStatusLabel,
  guideStatusTone,
  GUIDE_CLUSTER_OPTIONS,
  GUIDE_STATUS_OPTIONS,
} from "./guide-admin-shared";

type GuideRow = PaginatedQueryItem<typeof api.guides.queries.listGuides>;

function getGuideTitle(guide: GuideRow) {
  return guide.localized?.pageTitle || guide.pageTitle?.en || guide.slug;
}

function getGuideH1(guide: GuideRow) {
  return guide.localized?.h1 || guide.h1?.en || "";
}

export function GuidesAdminListClient({
  canManageRedirects,
  canManageGuides,
}: {
  canManageRedirects: boolean;
  canManageGuides: boolean;
}) {
  const toast = useToast();
  const deleteGuide = useMutation(api.guides.mutations.deleteGuide);
  const formOptions = useQuery(api.guides.queries.getGuideAdminFormOptions, {});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof GUIDE_STATUS_OPTIONS)[number]["value"]>("all");
  const [clusterFilter, setClusterFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [localeFilter, setLocaleFilter] = useState<"en" | "nl">("en");
  const [deleteCandidate, setDeleteCandidate] = useState<GuideRow | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { results, status, loadMore } = usePaginatedQuery(
    api.guides.queries.listGuides,
    {
      search: deferredSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      cluster: clusterFilter === "all" ? undefined : clusterFilter,
      locale: localeFilter,
      authorId: authorFilter === "all" ? undefined : (authorFilter as never),
    },
    { initialNumItems: 10 }
  );

  if (status === "LoadingFirstPage" && results.length === 0) {
    return <LoadingState label="Loading guides..." />;
  }

  const guideRows = results as GuideRow[];
  const publishedCount = results.filter((guide) => guide.status === "published").length;
  const reviewCount = results.filter((guide) => guide.status === "in_review").length;

  const handleDelete = async () => {
    if (!deleteCandidate) {
      return;
    }

    await deleteGuide({ id: deleteCandidate._id });
    toast.success({ description: "Guide deleted." });
    setDeleteCandidate(null);
  };

  return (
    <div className="space-y-8">
      <AccessibleDialog
        open={deleteCandidate !== null}
        title="Delete guide"
        description={
          deleteCandidate
            ? `Delete ${getGuideTitle(deleteCandidate)}? The record stays in Convex but leaves the active list.`
            : undefined
        }
        onClose={() => setDeleteCandidate(null)}
      >
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => setDeleteCandidate(null)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleDelete()}>
            Delete
          </Button>
        </div>
      </AccessibleDialog>

      <AdminPageHeader
        eyebrow="Product"
        title="Guides"
        description="Manage draft, review, and published guide pages from the Convex-backed library."
        actions={
          <>
            {canManageGuides ? (
              <Button variant="outline" render={<Link href="/admin/guides/import" />}>
                Import JSON
              </Button>
            ) : null}
            {canManageRedirects ? (
              <Button variant="outline" render={<Link href="/admin/guides/redirects" />}>
                Redirects
              </Button>
            ) : null}
            <Button render={<Link href="/admin/guides/new" />}>New guide</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard
          label="Loaded guides"
          value={results.length}
          description="Current rows loaded from Convex"
        />
        <AdminMetricCard
          label="Published"
          value={publishedCount}
          description="Live guide pages"
        />
        <AdminMetricCard
          label="In review"
          value={reviewCount}
          description="Waiting for admin approval"
        />
      </section>

      <AdminSectionCard title="Filters" description="Filter the guide library by status, cluster, locale, author, or title.">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search by slug or internal title"
            aria-label="Search guides"
          />
          <Select
            aria-label="Guide status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.currentTarget.value as (typeof GUIDE_STATUS_OPTIONS)[number]["value"])}
            options={GUIDE_STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <Select
            aria-label="Guide cluster filter"
            value={clusterFilter}
            onChange={(event) => setClusterFilter(event.currentTarget.value)}
            options={[
              { value: "all", label: "All clusters" },
              ...GUIDE_CLUSTER_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
          <Select
            aria-label="Guide locale filter"
            value={localeFilter}
            onChange={(event) => setLocaleFilter(event.currentTarget.value as "en" | "nl")}
            options={[
              { value: "en", label: "English" },
              { value: "nl", label: "Dutch" },
            ]}
          />
          <Select
            aria-label="Guide author filter"
            value={authorFilter}
            onChange={(event) => setAuthorFilter(event.currentTarget.value)}
            options={[
              { value: "all", label: "All authors" },
              ...(formOptions?.authorOptions ?? []).map((option) => ({
                value: String(option._id),
                label: option.label,
              })),
            ]}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--muted-foreground)]">
          <span>
            Showing {guideRows.length} guide{guideRows.length === 1 ? "" : "s"}
            {status === "LoadingMore" ? " while fetching more..." : ""}
          </span>
          <button
            type="button"
            className="font-medium text-[color:var(--foreground)] hover:underline"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setClusterFilter("all");
              setLocaleFilter("en");
              setAuthorFilter("all");
            }}
          >
            Clear filters
          </button>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Guide library"
        description="List view for all guide records with status and editing entry points."
      >
        {guideRows.length === 0 ? (
          <EmptyState
            title="No guides found"
            description="No guide records matched the current filters."
          />
        ) : (
          <AdminTable>
            <AdminTableHead
              columns={["Internal title", "Slug", "Cluster", "Author", "Status", "Updated", "Actions"]}
            />
            <tbody>
              {guideRows.map((guide) => (
                <AdminTableRow key={String(guide._id)}>
                  <AdminTableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{getGuideTitle(guide)}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">
                        {getGuideH1(guide) || "No H1 yet"}
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <code className="text-xs">{guide.slug}</code>
                  </AdminTableCell>
                  <AdminTableCell>{guide.cluster ?? "Unassigned"}</AdminTableCell>
                  <AdminTableCell>
                    {guide.authorDetail?.displayName || "Unassigned"}
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={guideStatusTone(guide.status)}>
                      {formatGuideStatusLabel(guide.status)}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{formatGuideDate(guide.updatedAt)}</AdminTableCell>
                  <AdminTableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        render={<Link href={`/admin/guides/${String(guide._id)}/edit`} />}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      {guide.status === "published" ? (
                        <Button
                          render={<Link href={`/guides/${guide.slug}`} />}
                          variant="outline"
                          size="sm"
                        >
                          Preview
                        </Button>
                      ) : null}
                      {canManageGuides ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCandidate(guide)}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        )}

        {status !== "Exhausted" ? (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              isLoading={status === "LoadingMore"}
              onClick={() => loadMore(10)}
            >
              Next 10
            </Button>
          </div>
        ) : null}
      </AdminSectionCard>
    </div>
  );
}
