import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Textarea } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { engineVersions, fitRuns, fitTraces } from "@/components/admin/fit/data";
import { cn } from "@/utils/cn";

function reviewTone(status: string) {
  if (status === "required") return "warning";
  if (status === "reviewed") return "success";
  if (status === "overridden") return "info";
  return "neutral";
}

export default async function FitRunDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const run = fitRuns.find((item) => item.sessionId === sessionId);

  if (!run) {
    notFound();
  }

  const traceSteps = fitTraces[run.sessionId] ?? [];
  const engineVersion = engineVersions.find((item) => item.id === run.engineVersionId);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fit operations"
        title={run.user}
        description={`${run.bike} · ${run.completedAt}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/fit-runs" />}>Back to runs</Button>
            <Button render={<Link href={`/admin/fit-engine/${run.engineVersionId}`} />}>Open version</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <AdminSectionCard title="Trace timeline" description="A readable timeline of the calculation steps that produced this fit result.">
          <div className="space-y-4">
            {traceSteps.map((step, index) => (
              <div
                key={`${step.step}-${index}`}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{step.step}</h3>
                  </div>
                  {step.warning ? <AdminStatusPill tone="warning">warning</AdminStatusPill> : null}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Method</p>
                    <p className="mt-1 text-sm">{step.method}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Input</p>
                    <p className="mt-1 text-sm">{step.input}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Output</p>
                    <p className="mt-1 text-sm">{step.output}</p>
                  </div>
                  {step.modifier ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Modifier</p>
                      <p className="mt-1 text-sm">{step.modifier}</p>
                    </div>
                  ) : null}
                </div>
                {step.warning ? (
                  <p className="mt-3 rounded-xl border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--secondary))] px-3 py-2 text-sm">
                    {step.warning}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard title="Summary" description="Core values and the review status at a glance.">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                  <CardHeader>
                    <CardDescription className="uppercase tracking-wide text-xs">Confidence</CardDescription>
                    <CardTitle className="text-2xl">{Math.round(run.confidenceScore * 100)}%</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                  <CardHeader>
                    <CardDescription className="uppercase tracking-wide text-xs">Review</CardDescription>
                    <CardTitle className="text-2xl">
                      <AdminStatusPill tone={reviewTone(run.reviewStatus)}>
                        {run.reviewStatus}
                      </AdminStatusPill>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Engine
                </p>
                <p className="text-sm">{engineVersion?.versionLabel ?? run.engineVersionId}</p>
              </div>

              <Progress value={run.confidenceScore * 100} max={100} label="Confidence" />

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Result summary
                </p>
                <p className="text-sm leading-6">{run.resultSummary}</p>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Snapshots" description="The exact data shape to expect from the backend trace contract.">
            <div className="space-y-3">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Rider snapshot</p>
                <p className="mt-2 text-sm leading-6">Height, inseam, flexibility, injury flags, and goal context are captured here.</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Bike snapshot</p>
                <p className="mt-2 text-sm leading-6">Linked bike geometry, setup values, and any derived frame-size data are represented here.</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">Engine version</p>
                <p className="mt-2 text-sm leading-6">Version label, rule hash, and deployment state should come from the planned admin backend contract.</p>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Manual review" description="Fit specialists can leave a note here once the queue needs attention.">
            <div className="space-y-3">
              <Textarea
                rows={4}
                placeholder="Add review notes, override context, or a summary of the final decision."
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Mark reviewed</Button>
                <Button variant="ghost">Save note only</Button>
              </div>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                The slice intentionally keeps this as UI only. The backend contract will attach the real review mutation later.
              </p>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
