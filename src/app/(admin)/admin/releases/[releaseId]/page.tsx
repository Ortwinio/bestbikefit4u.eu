import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui";
import { AdminMetricCard, AdminPageHeader, AdminSectionCard, AdminStatusPill } from "@/components/admin/layout/AdminUi";
import { releases } from "@/components/admin/releases/data";
import { releaseStatusTone, releaseTypeLabel, ReleaseStatusPill, ReleaseTypePill } from "@/components/admin/releases/release-ui";

function rolloutProgress(status: string) {
  if (status === "live") return 100;
  if (status === "rolling_out") return 86;
  if (status === "scheduled") return 68;
  if (status === "approved") return 56;
  if (status === "in_qa") return 42;
  if (status === "rolled_back") return 18;
  return 24;
}

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ releaseId: string }>;
}) {
  const { releaseId } = await params;
  const release = releases.find((item) => item.id === releaseId);

  if (!release) {
    notFound();
  }

  const isLive = release.status === "live";
  const isRollingOut = release.status === "rolling_out";
  const canApprove = release.status === "draft" || release.status === "in_qa";
  const canLaunch = release.status === "approved" || release.status === "scheduled";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Release governance"
        title={release.name}
        description={`${release.versionLabel} · owner ${release.owner}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/releases" />}>Back to releases</Button>
            <Button variant="outline" render={<Link href="/admin/releases/calendar" />}>Calendar</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="QA" value={release.qaStatus.toUpperCase()} description="Release approval gate" />
        <AdminMetricCard label="Linked items" value={release.linkedItems} description="Related issues, notes, and follow-ups" />
        <AdminMetricCard label="Bugs" value={release.bugs} description="Known issues in this rollout slice" />
        <AdminMetricCard label="Features" value={release.features} description="User-facing and internal additions" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
        <div className="space-y-6">
          <AdminSectionCard title="Release notes" description="The planned customer- and ops-facing changes bundled into this release.">
            <div className="space-y-3">
              {release.releaseNotes.map((note) => (
                <div key={note} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-sm leading-6">{note}</p>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Operational impact" description="What support and fit specialists should expect after rollout.">
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardDescription className="text-xs uppercase tracking-wide">Rollout health</CardDescription>
                  <CardTitle className="text-lg">{release.rolloutHealth}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardDescription className="text-xs uppercase tracking-wide">Rollback plan</CardDescription>
                  <CardTitle className="text-lg">{release.rollbackPlan}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Linked release context" description="The release scope that should stay visible to ops while this item is live.">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ReleaseTypePill type={release.type} />
                <ReleaseStatusPill status={release.status} />
              </div>
              <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                {release.summary}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Type</p>
                  <p className="mt-2 text-sm font-medium">{releaseTypeLabel(release.type)}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Rollout date</p>
                  <p className="mt-2 text-sm font-medium">{release.rolloutDate}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Live at</p>
                  <p className="mt-2 text-sm font-medium">{release.liveAt ?? "Not live yet"}</p>
                </div>
              </div>
            </div>
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard title="Rollout status" description="Quick decisions for the current release state.">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Progress</p>
                  <AdminStatusPill tone={releaseStatusTone(release.status)}>{release.status.replaceAll("_", " ")}</AdminStatusPill>
                </div>
                <Progress value={rolloutProgress(release.status)} max={100} label="Rollout progress" />
              </div>

              <div className="space-y-2">
                <Button className="w-full" disabled={!canApprove}>
                  Approve release
                </Button>
                <Button variant="outline" className="w-full" disabled={!canLaunch}>
                  Start rollout
                </Button>
                <Button variant="outline" className="w-full" disabled={!isRollingOut && !isLive}>
                  Roll back
                </Button>
              </div>

              <p className="text-xs leading-5 text-[color:var(--muted-foreground)]">
                These controls are UI-only in this slice. They reflect the planned release workflow contract without touching backend state.
              </p>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Ops checklist" description="The most important checks before and after rollout.">
            <div className="space-y-3">
              {[
                "QA sign-off captured",
                "Rollback path documented",
                "Support team notified",
                "Linked feedback items reviewed",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
