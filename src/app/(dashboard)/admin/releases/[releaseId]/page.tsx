import Link from "next/link";
import { notFound } from "next/navigation";
import type { Doc } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { Button, Card, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { ReleaseStatusControls } from "@/components/admin/releases/ReleaseStatusControls";
import {
  releaseStatusTone,
  releaseTypeLabel,
  ReleaseStatusPill,
  ReleaseTypePill,
} from "@/components/admin/releases/release-ui";
import { ReleaseActionPanel } from "@/components/admin/releases/ReleaseActionPanel";
import {
  formatAdminDate,
  formatAdminDateTime,
  getAdminDisplayName,
} from "@/components/admin/shared/admin-format";
import {
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "@/components/admin/shared/admin-live-data";

type ReleaseDetail = {
  release: Doc<"releases">;
  linkedItems: Doc<"release_items">[];
};

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
  const token = await getAdminQueryToken();
  const detail = (await fetchAdminQuery(
    api.admin.queries.getReleaseDetail,
    { releaseId: releaseId as Doc<"releases">["_id"] },
    token
  )) as ReleaseDetail | null;

  if (!detail) {
    notFound();
  }

  const users = await fetchAdminUsers(token);
  const userMap = new Map(users.map((user) => [user._id, user] as const));
  const release = detail.release;
  const ownerName = getAdminDisplayName(
    release.ownerId ? userMap.get(release.ownerId) : userMap.get(release.createdBy)
  );
  const releaseNotes = release.releaseNotes
    ? release.releaseNotes
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];
  const linkedFeedbackIds = detail.linkedItems
    .filter((item) => item.itemType === "feedback_item")
    .map((item) => String(item.itemId));
  const isLive = release.status === "live";
  const isRollingOut = release.status === "rolling_out";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Release governance"
        title={release.name}
        description={`${release.versionLabel ?? "No version label"} · owner ${ownerName}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/releases" />}>
              Back to releases
            </Button>
            <Button variant="outline" render={<Link href="/admin/releases/calendar" />}>
              Calendar
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="QA"
          value={release.qaStatus ?? "pending"}
          description="Release approval gate"
        />
        <AdminMetricCard
          label="Linked items"
          value={detail.linkedItems.length}
          description="Related issues, notes, and follow-ups"
        />
        <AdminMetricCard
          label="Audience"
          value={release.targetAudience ?? "Unset"}
          description="Who the release is intended for"
        />
        <AdminMetricCard
          label="Release state"
          value={release.status.replaceAll("_", " ")}
          description="Lifecycle state in Convex"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.85fr)]">
        <div className="space-y-6">
          <AdminSectionCard
            title="Release notes"
            description="The planned customer- and ops-facing changes bundled into this release."
          >
            <div className="space-y-3">
              {releaseNotes.length ? (
                releaseNotes.map((note) => (
                  <div
                    key={note}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                  >
                    <p className="text-sm leading-6">{note}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  No release notes stored yet.
                </p>
              )}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Operational impact"
            description="What support and fit specialists should expect after rollout."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardDescription className="text-xs uppercase tracking-wide">
                    Description
                  </CardDescription>
                  <CardTitle className="text-lg">
                    {release.description ?? "No description provided."}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardDescription className="text-xs uppercase tracking-wide">
                    Rollback plan
                  </CardDescription>
                  <CardTitle className="text-lg">
                    {release.rollbackPlan ?? "No rollback plan stored."}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Linked release context"
            description="The release scope that should stay visible to ops while this item is live."
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ReleaseTypePill type={release.type} />
                <ReleaseStatusPill status={release.status} />
              </div>
              <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                {release.targetAudience ?? "No target audience stored."}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Type
                  </p>
                  <p className="mt-2 text-sm font-medium">{releaseTypeLabel(release.type)}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Rollout date
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {formatAdminDate(release.rolloutDate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    Live at
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {release.liveAt ? formatAdminDateTime(release.liveAt) : "Not live yet"}
                  </p>
                </div>
              </div>
            </div>
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard
            title="Rollout status"
            description="Quick decisions for the current release state."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Progress</p>
                  <AdminStatusPill tone={releaseStatusTone(release.status)}>
                    {release.status.replaceAll("_", " ")}
                  </AdminStatusPill>
                </div>
                <Progress
                  value={rolloutProgress(release.status)}
                  max={100}
                  label="Rollout progress"
                />
              </div>

              <ReleaseStatusControls
                releaseId={release._id}
                currentStatus={release.status}
              />

              <p className="text-xs leading-5 text-[color:var(--muted-foreground)]">
                These controls are live and write directly to Convex release mutations.
              </p>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Linked items"
            description="Records attached to this release in the backend."
          >
            <div className="space-y-3">
              {detail.linkedItems.length ? (
                detail.linkedItems.map((item) => (
                  <div
                    key={`${item.itemType}-${item.itemId}`}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      {item.itemType.replaceAll("_", " ")}
                    </p>
                    <p className="mt-2 text-sm leading-6">{item.itemId}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  No linked items have been recorded yet.
                </p>
              )}
            </div>
          </AdminSectionCard>

          <ReleaseActionPanel
            releaseId={release._id}
            releaseStatus={release.status}
            linkedFeedbackIds={linkedFeedbackIds}
          />

          <AdminSectionCard
            title="Release snapshot"
            description="The current release object as stored in Convex."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Created
                </p>
                <p className="mt-2 text-sm leading-6">
                  {formatAdminDateTime(release.createdAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Audience
                </p>
                <p className="mt-2 text-sm leading-6">
                  {release.targetAudience ?? "Unset"}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Live / rolling out
                </p>
                <p className="mt-2 text-sm leading-6">
                  {isLive || isRollingOut ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
