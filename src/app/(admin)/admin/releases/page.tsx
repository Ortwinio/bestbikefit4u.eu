import Link from "next/link";
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
import { releases } from "@/components/admin/releases/data";
import { ReleaseFilters } from "@/components/admin/releases/ReleaseFilters";
import { releaseStatusTone, releaseTypeLabel, ReleaseTypePill } from "@/components/admin/releases/release-ui";

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilterValue<T extends string>(value: string | undefined, fallback: T, options: readonly T[]) {
  if (!value) return fallback;
  return options.includes(value as T) ? (value as T) : fallback;
}

const statusValues = ["all", "draft", "in_qa", "approved", "scheduled", "rolling_out", "live", "rolled_back"] as const;
const typeValues = ["all", "app", "fit_engine", "geometry_data", "content", "integration", "internal"] as const;

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = parseFilterValue(getSearchParam(resolvedSearchParams.status), "all", statusValues);
  const type = parseFilterValue(getSearchParam(resolvedSearchParams.type), "all", typeValues);

  const filteredReleases = releases.filter((release) => {
    const matchesStatus = status === "all" || release.status === status;
    const matchesType = type === "all" || release.type === type;
    return matchesStatus && matchesType;
  });

  const liveOrRolling = releases.filter((release) => release.status === "live" || release.status === "rolling_out");
  const upcoming = releases.filter((release) => release.status === "scheduled");
  const qaPending = releases.filter((release) => release.qaStatus === "pending");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Release governance"
        title="Releases"
        description="Track rollout state, QA readiness, and linked operational impact from a single admin surface."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/releases/calendar" />}>Calendar</Button>
            <Button variant="outline">Create release</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total releases" value={releases.length} description="UI slice release catalog" />
        <AdminMetricCard label="Live or rolling out" value={liveOrRolling.length} description="Current production exposure" />
        <AdminMetricCard label="Upcoming" value={upcoming.length} description="Scheduled but not live yet" />
        <AdminMetricCard label="QA pending" value={qaPending.length} description="Needs approval before rollout" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <AdminSectionCard
          title="Release list"
          description="Filter by lifecycle status or type, then open a release detail page."
          actions={<ReleaseFilters status={status} type={type} />}
        >
          <AdminTable>
            <AdminTableHead columns={["Release", "Type", "Status", "Owner", "Rollout", "Impact", "Action"]} />
            <tbody>
              {filteredReleases.map((release) => (
                <AdminTableRow key={release.id}>
                  <AdminTableCell className="font-medium">
                    <p>{release.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{release.versionLabel}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <ReleaseTypePill type={release.type}>{releaseTypeLabel(release.type)}</ReleaseTypePill>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={releaseStatusTone(release.status)}>
                      {release.status.replaceAll("_", " ")}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{release.owner}</AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1">
                      <p>{release.rolloutDate}</p>
                      {release.liveAt ? <p className="text-xs text-[color:var(--muted-foreground)]">Live {release.liveAt}</p> : null}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1 text-sm">
                      <p>{release.linkedItems} linked items</p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">{release.supportTickets} support tickets</p>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Button variant="ghost" size="sm" render={<Link href={`/admin/releases/${release.id}`} />}>Open</Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard title="Rollout health" description="Current production and scheduled activity at a glance.">
            <div className="space-y-3">
              {releases.slice(0, 3).map((release) => (
                <div key={release.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{release.name}</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">{release.summary}</p>
                    </div>
                    <AdminStatusPill tone={releaseStatusTone(release.status)}>
                      {release.status.replaceAll("_", " ")}
                    </AdminStatusPill>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[color:var(--muted-foreground)]">{release.rolloutDate}</span>
                    <span>{release.bugs} bugs / {release.features} features</span>
                  </div>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Release hygiene" description="QA readiness and rollback planning on the current catalog.">
            <div className="space-y-3">
              {releases.map((release) => (
                <div key={release.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3">
                  <div>
                    <p className="font-medium">{release.versionLabel}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{release.rollbackPlan}</p>
                  </div>
                  <AdminStatusPill tone={release.qaStatus === "passed" ? "success" : release.qaStatus === "failed" ? "danger" : "warning"}>
                    {release.qaStatus}
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
