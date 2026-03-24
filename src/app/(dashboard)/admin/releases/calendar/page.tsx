import Link from "next/link";
import type { Doc } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { releaseStatusTone } from "@/components/admin/releases/release-ui";
import {
  formatAdminDate,
  getAdminDisplayName,
} from "@/components/admin/shared/admin-format";
import {
  fetchAdminPaginatedQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "@/components/admin/shared/admin-live-data";

type ReleaseRecord = Doc<"releases">;

export default async function ReleaseCalendarPage() {
  const token = await getAdminQueryToken();
  const [releases, users] = await Promise.all([
    fetchAdminPaginatedQuery<ReleaseRecord>(api.admin.queries.listReleases, {}, token),
    fetchAdminUsers(token),
  ]);

  const userMap = new Map(users.map((user) => [user._id, user] as const));
  const releaseViews = [...releases]
    .sort(
      (left, right) =>
        (left.rolloutDate ?? left.liveAt ?? left.createdAt) -
        (right.rolloutDate ?? right.liveAt ?? right.createdAt)
    )
    .map((release) => ({
      release,
      ownerName: getAdminDisplayName(
        release.ownerId ? userMap.get(release.ownerId) : userMap.get(release.createdBy)
      ),
      dateLabel: formatAdminDate(release.rolloutDate ?? release.liveAt ?? release.createdAt),
    }));

  const releaseCount = releaseViews.length;
  const activeCount = releaseViews.filter(
    (view) => view.release.status === "rolling_out" || view.release.status === "live"
  ).length;
  const scheduledCount = releaseViews.filter((view) => view.release.status === "scheduled").length;
  const grouped = Object.entries(
    releaseViews.reduce<Record<string, typeof releaseViews>>((groups, view) => {
      const bucket = view.dateLabel;
      groups[bucket] ??= [];
      groups[bucket].push(view);
      return groups;
    }, {})
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Release governance"
        title="Release Calendar"
        description="A planning view for upcoming, rolling, and recently published releases."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/releases" />}>
              Back to releases
            </Button>
            <Button variant="outline" render={<Link href="/admin/releases?status=scheduled" />}>
              Scheduled
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          label="Planned items"
          value={releaseCount}
          description="Entries across the live schedule"
        />
        <AdminMetricCard
          label="Active releases"
          value={activeCount}
          description="Rolling out or live today"
        />
        <AdminMetricCard
          label="Scheduled"
          value={scheduledCount}
          description="Not live yet, but already queued"
        />
      </section>

      <AdminSectionCard
        title="Calendar"
        description="Each date row shows the release list and rollout stage for that day."
      >
        <div className="space-y-4">
          {grouped.map(([date, items]) => (
            <div
              key={date}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
            >
              <div className="flex flex-col gap-2 border-b border-[color:var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {date}
                  </p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {items.length
                      ? `${items.length} release${items.length === 1 ? "" : "s"}`
                      : "No releases scheduled"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.length
                    ? items.map((view) => (
                        <AdminStatusPill
                          key={view.release._id}
                          tone={releaseStatusTone(view.release.status)}
                        >
                          {view.release.status.replaceAll("_", " ")}
                        </AdminStatusPill>
                      ))
                    : null}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {items.length ? (
                  items.map((view) => (
                    <div
                      key={view.release._id}
                      className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{view.release.name}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {view.release.versionLabel ?? "No version label"} · {view.ownerName}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-[color:var(--muted-foreground)]">
                          {view.release.description ?? view.release.targetAudience ?? "No description provided."}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          render={<Link href={`/admin/releases/${view.release._id}`} />}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    This day is free for rollout work or release QA.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
