import Link from "next/link";
import { notFound } from "next/navigation";
import type { Doc } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Progress,
} from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { FitRunReviewPanel } from "@/components/admin/fit/FitRunReviewPanel";
import { reviewStatusTone } from "@/components/admin/fit/fit-ui";
import {
  formatAdminDateTime,
  formatAdminPercent,
  getAdminDisplayName,
  getBikeDisplayName,
} from "@/components/admin/shared/admin-format";
import { fetchAdminQuery, getAdminQueryToken } from "@/components/admin/shared/admin-live-data";
import {
  collectFitTraceArtifacts,
  type FitRunTraceDetail,
  formatTraceValue,
} from "./fit-trace";

function formatTraceLabel(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not recorded";
  }

  return Array.isArray(value) || typeof value === "object" ? formatTraceValue(value) : String(value);
}

export default async function FitRunDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const token = await getAdminQueryToken();
  const detail = (await fetchAdminQuery(
    api.admin.queries.getFitRunTrace,
    { sessionId: sessionId as Doc<"fitSessions">["_id"] },
    token
  )) as FitRunTraceDetail | null;

  if (!detail) {
    notFound();
  }

  const { session, user, bike, profile, engineVersion } = detail;
  const bikeLabel = getBikeDisplayName(bike);
  const confidence = formatAdminPercent(session.confidenceScore);
  const traceArtifacts = collectFitTraceArtifacts(detail);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title={getAdminDisplayName(user)}
        description={`${bikeLabel} · ${formatAdminDateTime(session.completedAt ?? session.createdAt)}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/fit-runs" />}>
              Back to runs
            </Button>
            {engineVersion ? (
              <Button
                render={<Link href={`/admin/fit-engine/${engineVersion._id}`} />}
              >
                Open version
              </Button>
            ) : (
              <Button disabled>Open version</Button>
            )}
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Confidence
            </CardDescription>
            <CardTitle className="text-2xl">{confidence}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Review
            </CardDescription>
            <CardTitle className="text-2xl">
              <AdminStatusPill tone={reviewStatusTone(session.reviewStatus ?? "not_required")}>
                {session.reviewStatus ?? "not_required"}
              </AdminStatusPill>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Engine
            </CardDescription>
            <CardTitle className="text-base leading-6">
              {engineVersion?.versionLabel ?? "No engine version recorded"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide">
              Session state
            </CardDescription>
            <CardTitle className="text-base leading-6">{session.status.replaceAll("_", " ")}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-6">
          <AdminSectionCard
            title="Session snapshot"
            description="Live fields stored in the fit session."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Riding style
                </p>
                <p className="mt-2 text-sm leading-6">{session.ridingStyle}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Primary goal
                </p>
                <p className="mt-2 text-sm leading-6">{session.primaryGoal}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Weekly hours
                </p>
                <p className="mt-2 text-sm leading-6">
                  {session.weeklyHours ?? "Unset"}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Longest ride
                </p>
                <p className="mt-2 text-sm leading-6">
                  {session.longestRideKm ? `${session.longestRideKm} km` : "Unset"}
                </p>
              </div>
            </div>
            {session.reviewNotes ? (
              <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Review notes
                </p>
                <p className="mt-2 text-sm leading-6">{session.reviewNotes}</p>
              </div>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard
            title="Rider profile"
            description="The rider measurement snapshot linked to this run."
          >
            {profile ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Height
                  </p>
                  <p className="mt-2 text-sm leading-6">{profile.heightCm} cm</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Inseam
                  </p>
                  <p className="mt-2 text-sm leading-6">{profile.inseamCm} cm</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Torso
                  </p>
                  <p className="mt-2 text-sm leading-6">{profile.torsoLengthCm} cm</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Flexibility
                  </p>
                  <p className="mt-2 text-sm leading-6">{profile.flexibilityScore}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No profile snapshot was attached to this run.
              </p>
            )}
          </AdminSectionCard>

          <AdminSectionCard
            title="Bike snapshot"
            description="The exact bike record associated with the run."
          >
            {bike ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Bike
                  </p>
                  <p className="mt-2 text-sm leading-6">{bikeLabel}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Type
                    </p>
                    <p className="mt-2 text-sm leading-6">{bike.bikeType}</p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Geometry record
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      {bike.geometryRecordId ?? "Unset"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No bike was linked to this run.
              </p>
            )}
          </AdminSectionCard>

          <AdminSectionCard
            title="Engine snapshot"
            description="The version that produced the fit output."
          >
            {engineVersion ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Version
                  </p>
                  <p className="mt-2 text-sm leading-6">{engineVersion.versionLabel}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Status
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {engineVersion.status}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    QA status
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {engineVersion.qaStatus ?? "pending"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Rollback plan
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {engineVersion.rollbackPlan ?? "No rollback plan stored."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No engine snapshot was attached to this run.
              </p>
            )}
          </AdminSectionCard>

          <AdminSectionCard
            title="Output and warnings"
            description="Any richer payloads already attached to the fit session."
          >
            {traceArtifacts.length === 0 ? (
              <EmptyState
                title="No extended trace payload"
                description="This session does not currently expose output or warning payloads beyond the core snapshot."
                className="border-none bg-transparent p-0 shadow-none"
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {traceArtifacts.map((artifact) => (
                  <div
                    key={artifact.key}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      {artifact.title}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[color:var(--muted-foreground)]">
                      {artifact.description}
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[color:var(--foreground)]">
                      {formatTraceLabel(artifact.value)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard
            title="Run summary"
            description="Core values and the review status at a glance."
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                  <CardHeader>
                    <CardDescription className="text-xs uppercase tracking-wide">
                      Confidence
                    </CardDescription>
                    <CardTitle className="text-2xl">{confidence}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                  <CardHeader>
                    <CardDescription className="text-xs uppercase tracking-wide">
                      Review
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      <AdminStatusPill tone={reviewStatusTone(session.reviewStatus ?? "not_required")}>
                        {session.reviewStatus ?? "not_required"}
                      </AdminStatusPill>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Progress value={session.confidenceScore ? Math.round(session.confidenceScore * 100) : 0} max={100} label="Confidence" />

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Result summary
                </p>
                <p className="text-sm leading-6">
                  {session.reviewNotes
                    ? "Review notes are recorded for this session."
                    : "No review note has been saved yet."}
                </p>
                {session.reviewNotes ? (
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Review notes
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{session.reviewNotes}</p>
                  </div>
                ) : null}
                {"resultSummary" in (session as Record<string, unknown>) ? (
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Session summary
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {formatTraceLabel((session as Record<string, unknown>).resultSummary)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Manual review"
            description="Fit specialists can leave a note here once the queue needs attention."
          >
            <FitRunReviewPanel
              sessionId={session._id}
              reviewStatus={session.reviewStatus}
              initialNotes={session.reviewNotes}
            />
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
