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
import { engineVersions } from "@/components/admin/fit/data";
import { engineStatusTone } from "@/components/admin/fit/fit-ui";

function getSearchParam(
  value: string | string[] | undefined
) {
  return Array.isArray(value) ? value[0] : value;
}

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "QA", value: "qa" },
  { label: "Draft", value: "draft" },
  { label: "Deprecated", value: "deprecated" },
] as const;

export default async function FitEnginePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = getSearchParam(resolvedSearchParams.status) ?? "all";
  const filteredVersions =
    status === "all"
      ? engineVersions
      : engineVersions.filter((version) => version.status === status);
  const activeVersion = engineVersions.find((version) => version.status === "active") ?? engineVersions[0];
  const qaVersion = engineVersions.find((version) => version.status === "qa");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title="Fit Engine"
        description="Manage engine versions, inspect the active rule set, and review version health before rollout."
        actions={
          <>
            <Button variant="outline">Create version</Button>
            <Button render={<Link href="/admin/fit-runs" />}>Open fit runs</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Versions" value={engineVersions.length} description="Active, QA, draft, and deprecated" />
        <AdminMetricCard label="Active version" value={activeVersion.versionLabel} description={activeVersion.description} />
        <AdminMetricCard label="QA version" value={qaVersion?.versionLabel ?? "None"} description="Awaiting approval or test sign-off" />
        <AdminMetricCard label="Review queue" value={engineVersions.reduce((sum, version) => sum + version.lowConfidenceCount, 0)} description="Low-confidence fits across versions" />
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
              columns={["Version", "Status", "Owner", "Runs", "Low confidence", "Confidence", "Action"]}
            />
            <tbody>
              {filteredVersions.map((version) => (
                <AdminTableRow key={version.id}>
                  <AdminTableCell className="font-medium">{version.versionLabel}</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={engineStatusTone(version.status)}>
                      {version.status}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{version.owner}</AdminTableCell>
                  <AdminTableCell>{version.runsCount.toLocaleString()}</AdminTableCell>
                  <AdminTableCell>{version.lowConfidenceCount}</AdminTableCell>
                  <AdminTableCell>{version.confidence}</AdminTableCell>
                  <AdminTableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/admin/fit-engine/${version.id}`} />}
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
          <AdminSectionCard title="Active version" description="The version currently used for new fit runs.">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold tracking-tight">{activeVersion.versionLabel}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">{activeVersion.description}</p>
                </div>
                <AdminStatusPill tone="success">live</AdminStatusPill>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Benchmark summary
                </p>
                <p className="text-sm text-[color:var(--foreground)]">{activeVersion.benchmark}</p>
              </div>
              <Button render={<Link href={`/admin/fit-engine/${activeVersion.id}`} />} className="w-full">
                Open active version
              </Button>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="QA snapshot" description="Use this to decide whether a draft is ready to activate.">
            {qaVersion ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{qaVersion.versionLabel}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{qaVersion.owner}</p>
                  </div>
                  <AdminStatusPill tone="warning">qa</AdminStatusPill>
                </div>
                <p className="text-sm text-[color:var(--muted-foreground)]">{qaVersion.description}</p>
                <p className="text-sm">{qaVersion.benchmark}</p>
                <Button variant="outline" size="sm" render={<Link href={`/admin/fit-engine/${qaVersion.id}`} />}>
                  Review QA version
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">No QA version is currently staged.</p>
            )}
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
