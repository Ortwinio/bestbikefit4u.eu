import Link from "next/link";
import { Button } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { releaseCalendar } from "@/components/admin/releases/data";
import { releaseStatusTone } from "@/components/admin/releases/release-ui";

const releaseCount = releaseCalendar.reduce((sum, entry) => sum + entry.releases.length, 0);
const activeCount = releaseCalendar.reduce(
  (sum, entry) =>
    sum + entry.releases.filter((release) => release.status === "rolling_out" || release.status === "live").length,
  0
);
const scheduledCount = releaseCalendar.reduce(
  (sum, entry) => sum + entry.releases.filter((release) => release.status === "scheduled").length,
  0
);

export default function ReleaseCalendarPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Release governance"
        title="Release Calendar"
        description="A planning view for upcoming, rolling, and recently published releases."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/releases" />}>Back to releases</Button>
            <Button variant="outline">Plan release</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard label="Planned items" value={releaseCount} description="Entries across the visible schedule" />
        <AdminMetricCard label="Active releases" value={activeCount} description="Rolling out or live today" />
        <AdminMetricCard label="Scheduled" value={scheduledCount} description="Not live yet, but already queued" />
      </section>

      <AdminSectionCard title="Calendar" description="Each date row shows the release list and rollout stage for that day.">
        <div className="space-y-4">
          {releaseCalendar.map((entry) => (
            <div key={entry.date} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
              <div className="flex flex-col gap-2 border-b border-[color:var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">{entry.date}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {entry.releases.length ? `${entry.releases.length} release${entry.releases.length === 1 ? "" : "s"}` : "No releases scheduled"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.releases.length
                    ? entry.releases.map((release) => (
                        <AdminStatusPill key={release.id} tone={releaseStatusTone(release.status)}>
                          {release.status.replaceAll("_", " ")}
                        </AdminStatusPill>
                      ))
                    : null}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {entry.releases.length ? (
                  entry.releases.map((release) => (
                    <div key={release.id} className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{release.name}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {release.versionLabel} · {release.owner}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-[color:var(--muted-foreground)]">{release.summary}</span>
                        <Button variant="ghost" size="sm" render={<Link href={`/admin/releases/${release.id}`} />}>Open</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[color:var(--muted-foreground)]">This day is free for rollout work or release QA.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
