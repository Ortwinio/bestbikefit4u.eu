"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { Button, EmptyState, LoadingState } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { formatAdminDate, formatAdminRelativeDate } from "@/components/admin/shared/live-admin-data";

export function OverviewAdminClient() {
  const stats = useQuery(api.admin.queries.getOverviewStats);

  if (stats === undefined) {
    return <LoadingState label="Loading overview..." />;
  }

  const reviewQueue = stats.manualReviewQueue ?? [];
  const recentFeedback = stats.recentFeedback ?? [];
  const activeReleases = stats.activeReleasesList ?? [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Command center"
        title="Overview"
        description="Live operational summary from Convex, not fixture data."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/users" />}>
              Open users
            </Button>
            <Button render={<Link href="/admin/fit-runs" />}>Open fit runs</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total users" value={stats.totalUsers} description="All rider accounts in Convex" />
        <AdminMetricCard label="Paid users" value={stats.paidUsers} description="Pro and premium riders" />
        <AdminMetricCard label="Manual review" value={stats.manualReviewQueueCount} description="Fit runs waiting for review" />
        <AdminMetricCard label="Active releases" value={stats.activeReleases} description="Rolling out or live" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <AdminSectionCard
          title="Review queue"
          description="The newest fit sessions and low-confidence runs waiting for human attention."
        >
          {reviewQueue.length === 0 ? (
            <EmptyState
              title="No manual review items"
              description="The current queue is empty."
            />
          ) : (
            <div className="space-y-3">
              {reviewQueue.map((session: Doc<"fitSessions">) => (
                <div
                  key={String(session._id)}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">Session {String(session._id)}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {session.status} · {session.reviewStatus ?? "not reviewed"}
                    </p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      Completed {formatAdminRelativeDate(session.completedAt ?? session.createdAt)}
                    </p>
                  </div>
                  <AdminStatusPill tone="warning">
                    {session.confidenceScore !== undefined
                      ? `${Math.round(session.confidenceScore * 100)}%`
                      : "review"}
                  </AdminStatusPill>
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="System state"
          description="The live admin surface now reports against Convex-backed system data."
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <AdminStatusPill tone="success">{stats.stravaConnected} Strava active</AdminStatusPill>
              <AdminStatusPill tone="info">{stats.openFeedbackCount} open feedback</AdminStatusPill>
              <AdminStatusPill tone="neutral">{stats.geometryBrandCount} geometry brands</AdminStatusPill>
            </div>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              Active engine: {stats.activeEngineVersion?.versionLabel ?? "—"}
              <br />
              Draft engine: {stats.draftEngineVersion?.versionLabel ?? "—"}
            </p>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              Active brand coverage: {stats.geometryActiveBrandCount}
            </p>
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard title="Recent feedback" description="Newest triage candidates from the live feedback queue.">
          {recentFeedback.length === 0 ? (
            <EmptyState title="No feedback items" description="There are no open feedback items right now." />
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((item: Doc<"feedback_items">) => (
                <div
                  key={String(item._id)}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {item.type} · {item.status}
                  </p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    Created {formatAdminRelativeDate(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Active releases" description="Live release records from Convex.">
          {activeReleases.length === 0 ? (
            <EmptyState title="No active releases" description="Nothing is currently live or rolling out." />
          ) : (
            <div className="space-y-3">
              {activeReleases.map((release: Doc<"releases">) => (
                <div
                  key={String(release._id)}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{release.name}</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {release.type} · {release.status}
                      </p>
                    </div>
                    <AdminStatusPill tone={release.status === "live" ? "success" : "warning"}>
                      {release.status}
                    </AdminStatusPill>
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                    Rollout {formatAdminDate(release.rolloutDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
