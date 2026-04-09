import Link from "next/link";
import { notFound } from "next/navigation";
import type { Doc } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { Button, Card, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { FitEngineStatusControls } from "@/components/admin/fit/FitEngineStatusControls";
import { engineStatusTone, reviewStatusTone } from "@/components/admin/fit/fit-ui";
import {
  formatAdminDateTime,
  getAdminDisplayName,
  getBikeDisplayName,
  formatAdminPercent,
  summarizeJsonText,
} from "@/components/admin/shared/admin-format";
import {
  fetchAdminBikes,
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "@/components/admin/shared/admin-live-data";

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

export default async function FitEngineVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const token = await getAdminQueryToken();

  const detail = (await fetchAdminQuery(
    api.admin.queries.getEngineVersionDetail,
    { versionId: versionId as Doc<"engine_versions">["_id"] },
    token
  )) as EngineVersionDetail | null;

  if (!detail) {
    notFound();
  }

  const [users, bikes] = await Promise.all([
    fetchAdminUsers(token),
    fetchAdminBikes(token),
  ]);

  const version = detail.version;
  const relatedRuns = [...detail.fitRuns].sort(
    (left, right) => getRunSortTime(right) - getRunSortTime(left)
  );
  const completedRuns = relatedRuns.filter((run) => run.status === "completed");
  const averageConfidence = getAverageConfidence(completedRuns);
  const lowConfidenceRuns = completedRuns.filter(
    (run) =>
      typeof run.confidenceScore === "number" && run.confidenceScore < 0.65
  );
  const ownerName = getAdminDisplayName(
    version.ownerId ? users.find((user) => user._id === version.ownerId) : undefined
  );
  const createdByName = getAdminDisplayName(
    users.find((user) => user._id === version.createdBy)
  );
  const activatedByName = getAdminDisplayName(
    version.activatedBy
      ? users.find((user) => user._id === version.activatedBy)
      : undefined
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title={version.versionLabel}
        description={version.description ?? "No description provided."}
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/fit-engine" />}>
              Back to versions
            </Button>
            <Button render={<Link href="/admin/fit-runs" />}>Open fit runs</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Status
            </CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AdminStatusPill tone={engineStatusTone(version.status)}>
                {version.status}
              </AdminStatusPill>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Runs under version
            </CardDescription>
            <CardTitle className="text-2xl">
              {relatedRuns.length.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Low-confidence runs
            </CardDescription>
            <CardTitle className="text-2xl">
              {lowConfidenceRuns.length.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Average confidence
            </CardDescription>
            <CardTitle className="text-base leading-6">
              {formatAdminPercent(averageConfidence)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.9fr)]">
        <div className="space-y-6">
          <AdminSectionCard
            title="Version metadata"
            description="Live backend fields for the selected engine version."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Owner
                </p>
                <p className="mt-2 text-sm leading-6">{ownerName}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Created by
                </p>
                <p className="mt-2 text-sm leading-6">{createdByName}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  QA status
                </p>
                <p className="mt-2 text-sm leading-6">
                  {version.qaStatus ?? "pending"}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Activated
                </p>
                <p className="mt-2 text-sm leading-6">
                  {version.activatedAt ? formatAdminDateTime(version.activatedAt) : "Pending"}
                  {version.activatedBy ? ` · ${activatedByName}` : ""}
                </p>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Rule set and benchmark"
            description="The backend payload currently stored for this engine version."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Rule set
                </p>
                <p className="mt-2 text-sm leading-6">
                  {summarizeJsonText(version.ruleSetJson)}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Benchmark results
                </p>
                <p className="mt-2 text-sm leading-6">
                  {summarizeJsonText(version.benchmarkResultsJson)}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Rollback plan
              </p>
              <p className="mt-2 text-sm leading-6">
                {version.rollbackPlan ?? "No rollback plan stored."}
              </p>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Recent fit runs"
            description="Sessions processed by this engine version."
          >
            <AdminTable>
              <AdminTableHead
                columns={["User", "Bike", "Completed", "Confidence", "Review", "Action"]}
              />
              <tbody>
                {relatedRuns.map((run) => {
                  const user = users.find((item) => item._id === run.userId);
                  const bike = run.bikeId
                    ? bikes.find((item) => item._id === run.bikeId)
                    : undefined;
                  const confidence = formatAdminPercent(run.confidenceScore);

                  return (
                    <AdminTableRow key={run._id}>
                      <AdminTableCell className="font-medium">
                        {getAdminDisplayName(user)}
                      </AdminTableCell>
                      <AdminTableCell>{getBikeDisplayName(bike)}</AdminTableCell>
                      <AdminTableCell>
                        {formatAdminDateTime(run.completedAt ?? run.createdAt)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="space-y-2">
                          <p>{confidence}</p>
                          {typeof run.confidenceScore === "number" ? (
                            <Progress
                              value={Math.round(run.confidenceScore * 100)}
                              max={100}
                            />
                          ) : null}
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={reviewStatusTone(run.reviewStatus ?? "not_required")}>
                          {run.reviewStatus ?? "not_required"}
                        </AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          render={<Link href={`/admin/fit-runs/${run._id}`} />}
                        >
                          Trace
                        </Button>
                      </AdminTableCell>
                    </AdminTableRow>
                  );
                })}
              </tbody>
            </AdminTable>
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard
            title="Health"
            description="Confidence and review pressure at a glance."
          >
            <div className="space-y-4">
              <Progress
                value={
                  averageConfidence !== null ? Math.round(averageConfidence * 100) : 0
                }
                max={100}
                label="Engine confidence"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Completed runs
                  </p>
                  <p className="mt-2 text-xl font-semibold">{completedRuns.length}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Review queue
                  </p>
                  <p className="mt-2 text-xl font-semibold">{lowConfidenceRuns.length}</p>
                </div>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Version workflow"
            description="Live status controls backed by Convex mutations."
          >
            <FitEngineStatusControls
              versionId={version._id}
              currentStatus={version.status}
            />
          </AdminSectionCard>

          <AdminSectionCard
            title="Current state"
            description="What the admin surface can confirm from Convex right now."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Last activation
                </p>
                <p className="mt-2 text-sm leading-6">
                  {version.activatedAt ? formatAdminDateTime(version.activatedAt) : "Pending"}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Low-confidence runs
                </p>
                <p className="mt-2 text-sm leading-6">
                  {lowConfidenceRuns.length} of {relatedRuns.length} processed sessions
                </p>
              </div>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
