"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { PaginatedQueryItem } from "convex/react";
import { Button, EmptyState, Input, LoadingState, Select } from "@/components/ui";
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
}: {
  canManageRedirects: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof GUIDE_STATUS_OPTIONS)[number]["value"]>("all");
  const [clusterFilter, setClusterFilter] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const { results, status, loadMore } = usePaginatedQuery(
    api.guides.queries.listGuides,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      cluster: clusterFilter === "all" ? undefined : clusterFilter,
      locale: "en",
    },
    { initialNumItems: 20 }
  );

  const filteredResults = useMemo(() => {
    const normalized = deferredSearch.trim().toLowerCase();
    if (!normalized) {
      return results;
    }

    return results.filter((guide) => {
      const localizedTitle = getGuideTitle(guide);
      return (
        guide.slug.toLowerCase().includes(normalized) ||
        localizedTitle.toLowerCase().includes(normalized) ||
        (guide.cluster ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [deferredSearch, results]);

  if (status === "LoadingFirstPage" && results.length === 0) {
    return <LoadingState label="Loading guides..." />;
  }

  const guideRows = filteredResults as GuideRow[];
  const publishedCount = results.filter((guide) => guide.status === "published").length;
  const reviewCount = results.filter((guide) => guide.status === "in_review").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Product"
        title="Guides"
        description="Manage draft, review, and published guide pages from the Convex-backed library."
        actions={
          <>
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

      <AdminSectionCard title="Filters" description="Filter the guide library by status, cluster, or title.">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
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
              columns={["Internal title", "Slug", "Cluster", "Status", "Updated", "Action"]}
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
                    <AdminStatusPill tone={guideStatusTone(guide.status)}>
                      {formatGuideStatusLabel(guide.status)}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{formatGuideDate(guide.updatedAt)}</AdminTableCell>
                  <AdminTableCell>
                    <Button
                      render={<Link href={`/admin/guides/${String(guide._id)}/edit`} />}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
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
              onClick={() => loadMore(20)}
            >
              Load more
            </Button>
          </div>
        ) : null}
      </AdminSectionCard>
    </div>
  );
}
