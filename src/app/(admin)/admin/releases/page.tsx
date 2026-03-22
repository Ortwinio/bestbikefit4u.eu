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
import { ReleaseFilters } from "@/components/admin/releases/ReleaseFilters";
import {
  releaseStatusTone,
  releaseTypeLabel,
  ReleaseTypePill,
} from "@/components/admin/releases/release-ui";
import {
  formatAdminDate,
  formatAdminDateTime,
  getAdminDisplayName,
} from "@/components/admin/shared/admin-format";
import {
  fetchAdminPaginatedQuery,
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "@/components/admin/shared/admin-live-data";

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilterValue<T extends string>(
  value: string | undefined,
  fallback: T,
  options: readonly T[]
) {
  if (!value) return fallback;
  return options.includes(value as T) ? (value as T) : fallback;
}

const statusValues = [
  "all",
  "draft",
  "in_qa",
  "approved",
  "scheduled",
  "rolling_out",
  "live",
  "rolled_back",
  "archived",
] as const;
const typeValues = [
  "all",
  "app",
  "fit_engine",
  "geometry_data",
  "content",
  "integration",
  "internal",
] as const;

type ReleaseDetail = {
  release: Doc<"releases">;
  linkedItems: Doc<"release_items">[];
};

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = parseFilterValue(
    getSearchParam(resolvedSearchParams.status),
    "all",
    statusValues
  );
  const type = parseFilterValue(getSearchParam(resolvedSearchParams.type), "all", typeValues);
  const token = await getAdminQueryToken();

  const [releases, users] = await Promise.all([
    fetchAdminPaginatedQuery<Doc<"releases">>(
      api.admin.queries.listReleases,
      {
        ...(status === "all" ? {} : { status }),
        ...(type === "all" ? {} : { type }),
      },
      token
    ),
    fetchAdminUsers(token),
  ]);

  const userMap = new Map(users.map((user) => [user._id, user] as const));
  const getOwnerName = (release: Doc<"releases">) =>
    getAdminDisplayName(
      release.ownerId
        ? userMap.get(release.ownerId)
        : userMap.get(release.createdBy)
    );

  const releaseViews = await Promise.all(
    releases.map(async (release) => {
      const detail = (await fetchAdminQuery(
        api.admin.queries.getReleaseDetail,
        { releaseId: release._id },
        token
      )) as ReleaseDetail;

      return {
        release: detail.release,
        linkedItems: detail.linkedItems,
        ownerName: getOwnerName(detail.release),
        releaseNotesList: detail.release.releaseNotes
          ? detail.release.releaseNotes
              .split("\n")
              .map((entry) => entry.trim())
              .filter(Boolean)
          : [],
      };
    })
  );

  const liveOrRolling = releaseViews.filter(
    (view) => view.release.status === "live" || view.release.status === "rolling_out"
  );
  const upcoming = releaseViews.filter((view) => view.release.status === "scheduled");
  const qaPending = releaseViews.filter((view) => view.release.qaStatus === "pending");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Release governance"
        title="Releases"
        description="Track rollout state, QA readiness, and linked operational impact from a single admin surface."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/releases/calendar" />}>
              Calendar
            </Button>
            <Button variant="outline" render={<Link href="/admin/releases?status=live" />}>
              Live releases
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Total releases"
          value={releaseViews.length}
          description="Live release catalog in Convex"
        />
        <AdminMetricCard
          label="Live or rolling out"
          value={liveOrRolling.length}
          description="Current production exposure"
        />
        <AdminMetricCard
          label="Upcoming"
          value={upcoming.length}
          description="Scheduled but not live yet"
        />
        <AdminMetricCard
          label="QA pending"
          value={qaPending.length}
          description="Needs approval before rollout"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <AdminSectionCard
          title="Release list"
          description="Filter by lifecycle status or type, then open a release detail page."
          actions={<ReleaseFilters status={status} type={type} />}
        >
          <AdminTable>
            <AdminTableHead
              columns={["Release", "Type", "Status", "Owner", "Rollout", "Linked items", "Action"]}
            />
            <tbody>
              {releaseViews.map((view) => (
                <AdminTableRow key={view.release._id}>
                  <AdminTableCell className="font-medium">
                    <p>{view.release.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                      {view.release.versionLabel ?? "No version label"}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <ReleaseTypePill type={view.release.type}>
                      {releaseTypeLabel(view.release.type)}
                    </ReleaseTypePill>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={releaseStatusTone(view.release.status)}>
                      {view.release.status.replaceAll("_", " ")}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{view.ownerName}</AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1">
                      <p>{formatAdminDate(view.release.rolloutDate)}</p>
                      {view.release.liveAt ? (
                        <p className="text-xs text-[color:var(--muted-foreground)]">
                          Live {formatAdminDateTime(view.release.liveAt)}
                        </p>
                      ) : null}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-1 text-sm">
                      <p>{view.linkedItems.length} linked items</p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {view.release.qaStatus ?? "pending"} QA
                      </p>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/admin/releases/${view.release._id}`} />}
                    >
                      Open
                    </Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard
            title="Rollout health"
            description="Current production and scheduled activity at a glance."
          >
            <div className="space-y-3">
              {releaseViews.slice(0, 3).map((view) => (
                <div
                  key={view.release._id}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{view.release.name}</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {view.release.description ?? view.release.targetAudience ?? "No description provided."}
                      </p>
                    </div>
                    <AdminStatusPill tone={releaseStatusTone(view.release.status)}>
                      {view.release.status.replaceAll("_", " ")}
                    </AdminStatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-[color:var(--muted-foreground)]">
                      {formatAdminDate(view.release.rolloutDate)}
                    </span>
                    <span>{view.linkedItems.length} linked items</span>
                  </div>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Release hygiene"
            description="QA readiness and rollback planning on the current catalog."
          >
            <div className="space-y-3">
              {releaseViews.map((view) => (
                <div
                  key={view.release._id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{view.release.versionLabel ?? view.release.name}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {view.release.rollbackPlan ?? "No rollback plan stored."}
                    </p>
                  </div>
                  <AdminStatusPill
                    tone={
                      view.release.qaStatus === "passed"
                        ? "success"
                        : view.release.qaStatus === "failed"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {view.release.qaStatus ?? "pending"}
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
