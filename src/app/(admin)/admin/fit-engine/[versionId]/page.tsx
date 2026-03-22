import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { engineVersions, fitRuns } from "@/components/admin/fit/data";
import { engineStatusTone, reviewStatusTone } from "@/components/admin/fit/fit-ui";
import { cn } from "@/utils/cn";

const ruleSet = {
  confidence: "Blend rider input with geometry and historical correction weights.",
  comfort: "Increase saddle and bar comfort when low mobility is detected.",
  caution: "Promote manual review when warnings exceed threshold.",
  geometry: "Prefer linked geometry records over inferred defaults.",
};

export default async function FitEngineVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const version = engineVersions.find((item) => item.id === versionId);

  if (!version) {
    notFound();
  }

  const relatedRuns = fitRuns.filter((run) => run.engineVersionId === version.id);
  const confidenceProgress =
    version.status === "active"
      ? 92
      : version.status === "qa"
        ? 74
        : version.status === "draft"
          ? 40
          : 20;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title={version.versionLabel}
        description={version.description}
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/fit-engine" />}>Back to versions</Button>
            <Button render={<Link href="/admin/fit-runs" />}>Open fit runs</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="uppercase tracking-wide text-xs">Status</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AdminStatusPill tone={engineStatusTone(version.status)}>{version.status}</AdminStatusPill>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="uppercase tracking-wide text-xs">Runs under version</CardDescription>
            <CardTitle className="text-2xl">{version.runsCount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="uppercase tracking-wide text-xs">Low-confidence runs</CardDescription>
            <CardTitle className="text-2xl">{version.lowConfidenceCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardHeader>
            <CardDescription className="uppercase tracking-wide text-xs">Benchmark</CardDescription>
            <CardTitle className="text-base leading-6">{version.benchmark}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.9fr)]">
        <div className="space-y-6">
          <AdminSectionCard title="Rule set" description="Read-only summary of the current engine behavior.">
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(ruleSet).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {key}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">{value}</p>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Recent fit runs" description="Latest sessions processed by this engine version.">
            <AdminTable>
              <AdminTableHead columns={["User", "Bike", "Completed", "Confidence", "Review", "Action"]} />
              <tbody>
                {relatedRuns.map((run) => (
                  <AdminTableRow key={run.sessionId}>
                    <AdminTableCell className="font-medium">{run.user}</AdminTableCell>
                    <AdminTableCell>{run.bike}</AdminTableCell>
                    <AdminTableCell>{run.completedAt}</AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-2">
                        <p>{Math.round(run.confidenceScore * 100)}%</p>
                        <Progress value={run.confidenceScore * 100} max={100} />
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={reviewStatusTone(run.reviewStatus)}>
                        {run.reviewStatus}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <Button variant="ghost" size="sm" render={<Link href={`/admin/fit-runs/${run.sessionId}`} />}>
                        Trace
                      </Button>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard title="Version workflow" description="Human review actions for this version.">
            <div className="space-y-3">
              <div className={cn("rounded-2xl border p-4", version.status === "active" ? "border-[color:color-mix(in_oklch,var(--success)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--secondary))]" : "border-[color:var(--border)] bg-[color:var(--secondary)]")}>
                <p className="text-sm font-medium">Current owner</p>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{version.owner}</p>
              </div>
              <div className="space-y-2">
                <Button className="w-full" disabled={version.status !== "draft"}>
                  Submit for QA
                </Button>
                <Button variant="outline" className="w-full" disabled={version.status !== "qa"}>
                  Activate this version
                </Button>
                <Button variant="outline" className="w-full" disabled={version.status === "deprecated"}>
                  Deprecate
                </Button>
              </div>
              <p className="text-xs leading-5 text-[color:var(--muted-foreground)]">
                These controls are wired to the planned admin backend contract and are represented here as the UI shell for the fit-engine slice.
              </p>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Health" description="Confidence and review pressure at a glance.">
            <div className="space-y-4">
              <Progress value={confidenceProgress} max={100} label="Engine confidence" />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">Confidence</p>
                  <p className="mt-2 text-xl font-semibold">{version.confidence}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">QA date</p>
                  <p className="mt-2 text-xl font-semibold">{version.activatedAt ?? "Pending"}</p>
                </div>
              </div>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
