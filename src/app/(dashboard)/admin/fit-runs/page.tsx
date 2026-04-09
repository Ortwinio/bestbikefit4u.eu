import Link from "next/link";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { Button, Input } from "@/components/ui";
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
import { reviewStatusTone } from "@/components/admin/fit/fit-ui";
import {
  formatAdminDateTime,
  formatAdminPercent,
  getAdminDisplayName,
  getBikeDisplayName,
} from "@/components/admin/shared/admin-format";
import {
  fetchAdminBikes,
  fetchAdminPaginatedQuery,
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "@/components/admin/shared/admin-live-data";
import { cn } from "@/utils/cn";

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const reviewFilters = [
  { label: "All", value: "all" },
  { label: "Needs review", value: "required" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Overridden", value: "overridden" },
] as const;

type FitRunRecord = Doc<"fitSessions">;

export default async function FitRunsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = getSearchParam(resolvedSearchParams.q)?.toLowerCase().trim() ?? "";
  const review = getSearchParam(resolvedSearchParams.review) ?? "all";
  const token = await getAdminQueryToken();

  const [runs, users, bikes, versions] = await Promise.all([
    fetchAdminPaginatedQuery<FitRunRecord>(api.admin.queries.listFitRuns, {}, token),
    fetchAdminUsers(token),
    fetchAdminBikes(token),
    fetchAdminQuery<Doc<"engine_versions">[]>(
      api.admin.queries.listEngineVersions,
      {},
      token
    ),
  ]);

  const userMap = new Map(users.map((user) => [user._id, user]));
  const bikeMap = new Map(bikes.map((bike) => [bike._id, bike]));
  const versionMap = new Map(versions.map((version) => [version._id, version]));

  const runViews = [...runs]
    .sort((left, right) => (right.completedAt ?? right.createdAt) - (left.completedAt ?? left.createdAt))
    .map((run) => {
      const user = userMap.get(run.userId);
      const bike = run.bikeId ? bikeMap.get(run.bikeId) : undefined;
      const engineVersion = run.engineVersionId
        ? versionMap.get(run.engineVersionId)
        : undefined;

      return {
        run,
        userName: getAdminDisplayName(user),
        bikeName: getBikeDisplayName(bike),
        engineVersionLabel:
          engineVersion?.versionLabel ?? run.engineVersionId ?? "Unknown version",
        searchText: [
          run._id,
          getAdminDisplayName(user),
          getBikeDisplayName(bike),
          engineVersion?.versionLabel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    });

  const filteredRuns = runViews.filter((view) => {
    const runStatus = view.run.reviewStatus ?? "not_required";
    const matchesQuery = !query || view.searchText.includes(query);
    const matchesReview = review === "all" || runStatus === review;
    return matchesQuery && matchesReview;
  });

  const needsReview = runViews.filter((run) => run.run.reviewStatus === "required").length;
  const reviewed = runViews.filter((run) => run.run.reviewStatus === "reviewed").length;
  const confidenceValues = runViews.flatMap((run) =>
    typeof run.run.confidenceScore === "number" ? [run.run.confidenceScore] : []
  );
  const avgConfidence = confidenceValues.length
    ? Math.round(
        (confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length) *
          100
      )
    : 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title="Fit Runs"
        description="Trace the exact fit journey, filter the review queue, and jump into the underlying session output."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/fit-engine" />}>
              Engine versions
            </Button>
            <Button render={<Link href="/admin/fit-runs" />}>Refresh list</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Total runs"
          value={runViews.length}
          description="Live fit sessions in Convex"
        />
        <AdminMetricCard
          label="Needs review"
          value={needsReview}
          description="Confidence below threshold"
        />
        <AdminMetricCard
          label="Reviewed"
          value={reviewed}
          description="Marking notes already added"
        />
        <AdminMetricCard
          label="Average confidence"
          value={`${avgConfidence}%`}
          description="Overall output confidence"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
        <AdminSectionCard
          title="Runs"
          description="Search by rider, bike, or session id. Use the filter chips to narrow review status."
          actions={
            <form method="get" className="flex flex-wrap items-center gap-2">
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search runs"
                className="w-56"
              />
              <input type="hidden" name="review" value={review} />
              <Button type="submit">Search</Button>
            </form>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {reviewFilters.map((filter) => {
              const active = review === filter.value;
              const href =
                filter.value === "all"
                  ? `/admin/fit-runs${query ? `?q=${encodeURIComponent(query)}` : ""}`
                  : `/admin/fit-runs?review=${filter.value}${
                      query ? `&q=${encodeURIComponent(query)}` : ""
                    }`;

              return (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={active ? "primary" : "outline"}
                  render={<Link href={href} />}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>

          <AdminTable>
            <AdminTableHead
              columns={["User", "Bike", "Engine", "Completed", "Confidence", "Review", "Action"]}
            />
            <tbody>
              {filteredRuns.map((view) => (
                <AdminTableRow key={view.run._id}>
                  <AdminTableCell className="font-medium">{view.userName}</AdminTableCell>
                  <AdminTableCell>{view.bikeName}</AdminTableCell>
                  <AdminTableCell>{view.engineVersionLabel}</AdminTableCell>
                  <AdminTableCell>
                    {formatAdminDateTime(view.run.completedAt ?? view.run.createdAt)}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span>{formatAdminPercent(view.run.confidenceScore)}</span>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          {view.run.reviewNotes ? "review notes saved" : "no review note"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[color:var(--muted)]">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            typeof view.run.confidenceScore === "number" &&
                              view.run.confidenceScore >= 0.85
                              ? "bg-[color:var(--success)]"
                              : typeof view.run.confidenceScore === "number" &&
                                  view.run.confidenceScore >= 0.65
                                ? "bg-[color:var(--warning)]"
                                : "bg-[color:var(--danger)]"
                          )}
                          style={{
                            width:
                              typeof view.run.confidenceScore === "number"
                                ? `${Math.round(view.run.confidenceScore * 100)}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill
                      tone={reviewStatusTone(view.run.reviewStatus ?? "not_required")}
                    >
                      {view.run.reviewStatus ?? "not_required"}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/admin/fit-runs/${view.run._id}`} />}
                    >
                      Trace
                    </Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard
            title="Review queue"
            description="The highest-priority sessions to inspect manually."
          >
            <div className="space-y-3">
              {runViews
                .filter((view) => view.run.reviewStatus === "required")
                .slice(0, 3)
                .map((view) => (
                  <div
                    key={view.run._id}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{view.userName}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {view.bikeName}
                        </p>
                      </div>
                      <AdminStatusPill tone="warning">review</AdminStatusPill>
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                      {view.run.reviewNotes ?? "No review note recorded yet."}
                    </p>
                  </div>
                ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Version mix"
            description="Quick view of which engine versions power the current set."
          >
            <div className="space-y-3">
              {versions.map((version) => {
                const count = runViews.filter(
                  (view) => view.run.engineVersionId === version._id
                ).length;
                return (
                  <div
                    key={version._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{version.versionLabel}</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {count} runs
                      </p>
                    </div>
                    <AdminStatusPill
                      tone={
                        version.status === "active"
                          ? "success"
                          : version.status === "qa"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {version.status}
                    </AdminStatusPill>
                  </div>
                );
              })}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
