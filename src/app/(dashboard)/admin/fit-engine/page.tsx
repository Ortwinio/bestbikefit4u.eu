import Link from "next/link";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui";
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
import { FitEngineStatusControls } from "@/components/admin/fit/FitEngineStatusControls";
import { engineStatusTone } from "@/components/admin/fit/fit-ui";
import {
  formatAdminDateTime,
  getAdminDisplayName,
  summarizeJsonText,
} from "@/components/admin/shared/admin-format";
import {
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "@/components/admin/shared/admin-live-data";

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "QA", value: "qa" },
  { label: "Draft", value: "draft" },
  { label: "Deprecated", value: "deprecated" },
] as const;

type EngineVersionDetail = {
  version: Doc<"engine_versions">;
  fitRuns: Doc<"fitSessions">[];
};

function getRunSortTime(run: Doc<"fitSessions">) {
  return run.completedAt ?? run.createdAt;
}

function getAverageConfidence(runs: Doc<"fitSessions">[]) {
  const values = runs.flatMap((run) =>
    typeof run.confidenceScore === "number" ? [run.confidenceScore] : []
  );

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default async function FitEnginePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = getSearchParam(resolvedSearchParams.status) ?? "all";
  const token = await getAdminQueryToken();

  const [versions, users] = await Promise.all([
    fetchAdminQuery<Doc<"engine_versions">[]>(
      api.admin.queries.listEngineVersions,
      {},
      token
    ),
    fetchAdminUsers(token),
  ]);
  const userMap = new Map(users.map((user) => [user._id, user] as const));
  const getUserName = (userId: Doc<"users">["_id"] | undefined) =>
    getAdminDisplayName(userId ? userMap.get(userId) : undefined);

  const versionViews = await Promise.all(
    versions.map(async (version) => {
      const detail = (await fetchAdminQuery(
        api.admin.queries.getEngineVersionDetail,
        { versionId: version._id },
        token
      )) as EngineVersionDetail;
      const sortedRuns = [...detail.fitRuns].sort(
        (left, right) => getRunSortTime(right) - getRunSortTime(left)
      );
      const lowConfidenceCount = sortedRuns.filter(
        (run) =>
          run.status === "completed" &&
          typeof run.confidenceScore === "number" &&
          run.confidenceScore < 0.65
      ).length;

      return {
        version: detail.version,
        fitRuns: sortedRuns,
        runCount: sortedRuns.length,
        lowConfidenceCount,
        ownerName: getUserName(version.ownerId),
        createdByName: getUserName(version.createdBy),
        activatedByName: getUserName(version.activatedBy),
        averageConfidence: getAverageConfidence(sortedRuns),
      };
    })
  );

  const filteredVersions =
    status === "all"
      ? versionViews
      : versionViews.filter((version) => version.version.status === status);
  const activeVersion =
    versionViews.find((version) => version.version.status === "active") ?? null;
  const qaVersion =
    versionViews.find((version) => version.version.status === "qa") ?? null;
  const reviewQueueCount = versionViews.reduce(
    (sum, version) => sum + version.lowConfidenceCount,
    0
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title="Fit Engine"
        description="Manage engine versions, inspect the active rule set, and review version health before rollout."
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href="#version-workflow" />}
            >
              Review workflow
            </Button>
            <Button render={<Link href="/admin/fit-runs" />}>Open fit runs</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Versions"
          value={versionViews.length}
          description="Active, QA, draft, and deprecated"
        />
        <AdminMetricCard
          label="Active version"
          value={activeVersion?.version.versionLabel ?? "None"}
          description={activeVersion?.version.description ?? "No active engine version"}
        />
        <AdminMetricCard
          label="QA version"
          value={qaVersion?.version.versionLabel ?? "None"}
          description="Awaiting approval or test sign-off"
        />
        <AdminMetricCard
          label="Review queue"
          value={reviewQueueCount}
          description="Low-confidence fits across versions"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <AdminSectionCard
          title="Versions"
          description="Filter by rollout status and open a version detail page."
          actions={
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isActive = status === option.value;
                const href =
                  option.value === "all"
                    ? "/admin/fit-engine"
                    : `/admin/fit-engine?status=${option.value}`;

                return (
                  <Button
                    key={option.value}
                    variant={isActive ? "primary" : "outline"}
                    size="sm"
                    render={<Link href={href} />}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          }
        >
          <AdminTable>
            <AdminTableHead
              columns={[
                "Version",
                "Status",
                "Owner",
                "Runs",
                "Low confidence",
                "Average confidence",
                "Action",
              ]}
            />
            <tbody>
              {filteredVersions.map((version) => (
                <AdminTableRow key={version.version._id}>
                  <AdminTableCell className="font-medium">
                    <p>{version.version.versionLabel}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                      Created by {version.createdByName}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={engineStatusTone(version.version.status)}>
                      {version.version.status}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{version.ownerName}</AdminTableCell>
                  <AdminTableCell>{version.runCount.toLocaleString()}</AdminTableCell>
                  <AdminTableCell>{version.lowConfidenceCount}</AdminTableCell>
                  <AdminTableCell>
                    {version.averageConfidence !== null
                      ? `${Math.round(version.averageConfidence * 100)}%`
                      : "—"}
                  </AdminTableCell>
                  <AdminTableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/admin/fit-engine/${version.version._id}`} />}
                    >
                      View
                    </Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard
            title="Active version"
            description="The version currently used for new fit runs."
          >
            {activeVersion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">
                      {activeVersion.version.versionLabel}
                    </p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {activeVersion.version.description ?? "No description provided."}
                    </p>
                  </div>
                  <AdminStatusPill tone="success">live</AdminStatusPill>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Benchmark summary
                  </p>
                  <p className="text-sm text-[color:var(--foreground)]">
                    {summarizeJsonText(activeVersion.version.benchmarkResultsJson)}
                  </p>
                </div>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Activated {formatAdminDateTime(activeVersion.version.activatedAt)}
                  {activeVersion.version.activatedBy
                    ? ` · by ${activeVersion.activatedByName}`
                    : ""}
                </p>
                <Button
                  render={
                    <Link href={`/admin/fit-engine/${activeVersion.version._id}`} />
                  }
                  className="w-full"
                >
                  Open active version
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No active version is currently staged.
              </p>
            )}
          </AdminSectionCard>

          <AdminSectionCard
            title="QA snapshot"
            description="Use this to decide whether a draft is ready to activate."
          >
            {qaVersion ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{qaVersion.version.versionLabel}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {qaVersion.ownerName}
                    </p>
                  </div>
                  <AdminStatusPill tone="warning">qa</AdminStatusPill>
                </div>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {qaVersion.version.description ?? "No description provided."}
                </p>
                <p className="text-sm">
                  Rule set: {summarizeJsonText(qaVersion.version.ruleSetJson)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/admin/fit-engine/${qaVersion.version._id}`} />}
                >
                  Review QA version
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No QA version is currently staged.
              </p>
            )}
          </AdminSectionCard>

          <div id="version-workflow">
            <AdminSectionCard
            title="Version workflow"
            description="Live status controls backed by Convex mutations."
          >
            {activeVersion ? (
              <FitEngineStatusControls
                versionId={activeVersion.version._id}
                currentStatus={activeVersion.version.status}
              />
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Status controls appear when at least one version exists.
              </p>
            )}
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
