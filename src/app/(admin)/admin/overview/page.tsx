import Link from "next/link";
import { Button } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { engineVersions, fitRuns } from "@/components/admin/fit/data";

export default function AdminOverviewPage() {
  const activeVersion = engineVersions.find((version) => version.status === "active") ?? engineVersions[0];
  const reviewQueue = fitRuns.filter((run) => run.reviewStatus === "required");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Command center"
        title="Overview"
        description="A protected admin shell with live entry points into the fit-engine and fit-run workflows."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/fit-engine" />}>
              Open fit engine
            </Button>
            <Button render={<Link href="/admin/fit-runs" />}>Open fit runs</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Engine versions"
          value={engineVersions.length}
          description="Tracked from the current admin UI slice"
        />
        <AdminMetricCard
          label="Active version"
          value={activeVersion.versionLabel}
          description={activeVersion.description}
        />
        <AdminMetricCard
          label="Review queue"
          value={reviewQueue.length}
          description="Runs waiting for manual inspection"
        />
        <AdminMetricCard
          label="Confidence"
          value={`${Math.round(
            (fitRuns.reduce((sum, run) => sum + run.confidenceScore, 0) / fitRuns.length) * 100
          )}%`}
          description="Average across the local fit-run slice"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <AdminSectionCard
          title="Review queue"
          description="The newest fit runs that need a human look."
        >
          <div className="space-y-3">
            {reviewQueue.slice(0, 5).map((run) => (
              <div
                key={run.sessionId}
                className="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
              >
                <div>
                  <p className="font-medium">{run.user}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">{run.bike}</p>
                </div>
                <AdminStatusPill tone="warning">review</AdminStatusPill>
              </div>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Shell state"
          description="This page proves the protected shell, server gate, and shared UI layer."
        >
          <div className="space-y-3">
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              The admin shell is server-gated in the protected layout, while the public login route remains separate.
            </p>
            <div className="flex flex-wrap gap-2">
              <AdminStatusPill tone="success">server gated</AdminStatusPill>
              <AdminStatusPill tone="info">prototyper ui</AdminStatusPill>
              <AdminStatusPill tone="neutral">overview</AdminStatusPill>
            </div>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
