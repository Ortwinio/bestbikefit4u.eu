import Link from "next/link";
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
import { fitRuns, engineVersions } from "@/components/admin/fit/data";
import { reviewStatusTone } from "@/components/admin/fit/fit-ui";
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

export default async function FitRunsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = getSearchParam(resolvedSearchParams.q)?.toLowerCase().trim() ?? "";
  const review = getSearchParam(resolvedSearchParams.review) ?? "all";

  const filteredRuns = fitRuns.filter((run) => {
    const matchesQuery =
      !query ||
      run.user.toLowerCase().includes(query) ||
      run.bike.toLowerCase().includes(query) ||
      run.sessionId.toLowerCase().includes(query);
    const matchesReview = review === "all" || run.reviewStatus === review;
    return matchesQuery && matchesReview;
  });

  const needsReview = fitRuns.filter((run) => run.reviewStatus === "required").length;
  const reviewed = fitRuns.filter((run) => run.reviewStatus === "reviewed").length;
  const overridden = fitRuns.filter((run) => run.reviewStatus === "overridden").length;
  const avgConfidence = Math.round(
    (fitRuns.reduce((sum, run) => sum + run.confidenceScore, 0) / fitRuns.length) * 100
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title="Fit Runs"
        description="Trace the exact fit journey, filter the review queue, and jump into the underlying session output."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/fit-engine" />}>Engine versions</Button>
            <Button render={<Link href="/admin/fit-runs/run-18255" />}>Open trace</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total runs" value={fitRuns.length} description="Filtered sample in the UI slice" />
        <AdminMetricCard label="Needs review" value={needsReview} description="Confidence below threshold" />
        <AdminMetricCard label="Reviewed" value={reviewed} description="Marking notes already added" />
        <AdminMetricCard label="Average confidence" value={`${avgConfidence}%`} description="Overall output confidence" />
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
                  : `/admin/fit-runs?review=${filter.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

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
            <AdminTableHead columns={["User", "Bike", "Engine", "Completed", "Confidence", "Review", "Action"]} />
            <tbody>
              {filteredRuns.map((run) => (
                <AdminTableRow key={run.sessionId}>
                  <AdminTableCell className="font-medium">{run.user}</AdminTableCell>
                  <AdminTableCell>{run.bike}</AdminTableCell>
                  <AdminTableCell>
                    {engineVersions.find((version) => version.id === run.engineVersionId)?.versionLabel ?? run.engineVersionId}
                  </AdminTableCell>
                  <AdminTableCell>{run.completedAt}</AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span>{Math.round(run.confidenceScore * 100)}%</span>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          {run.warningsCount} warnings
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[color:var(--muted)]">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            run.confidenceScore >= 0.85
                              ? "bg-[color:var(--success)]"
                              : run.confidenceScore >= 0.65
                                ? "bg-[color:var(--warning)]"
                                : "bg-[color:var(--danger)]"
                          )}
                          style={{ width: `${Math.round(run.confidenceScore * 100)}%` }}
                        />
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={reviewStatusTone(run.reviewStatus)}>
                      {run.reviewStatus}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Button variant="ghost" size="sm" render={<Link href={`/admin/fit-runs/${run.sessionId}`} />}>
                      Trace
                    </Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard title="Review queue" description="The highest-priority sessions to inspect manually.">
            <div className="space-y-3">
              {fitRuns
                .filter((run) => run.reviewStatus === "required")
                .slice(0, 3)
                .map((run) => (
                  <div key={run.sessionId} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{run.user}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">{run.bike}</p>
                      </div>
                      <AdminStatusPill tone="warning">review</AdminStatusPill>
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{run.resultSummary}</p>
                  </div>
                ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Version mix" description="Quick view of which engine versions power the current set.">
            <div className="space-y-3">
              {engineVersions.map((version) => (
                <div key={version.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3">
                  <div>
                    <p className="font-medium">{version.versionLabel}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{version.runsCount} runs</p>
                  </div>
                  <AdminStatusPill tone={version.status === "active" ? "success" : version.status === "qa" ? "warning" : "neutral"}>
                    {version.status}
                  </AdminStatusPill>
                </div>
              ))}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
