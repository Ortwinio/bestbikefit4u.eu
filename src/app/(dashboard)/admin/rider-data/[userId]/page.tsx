"use client";

import Link from "next/link";
import { use } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import { ErrorState } from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

interface PageProps {
  params: Promise<{ userId: string }>;
}

function formatDateTime(value?: number | string | null) {
  if (value === undefined || value === null || value === "") {
    return "Not set";
  }

  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toneForTier(tier?: string | null) {
  if (tier === "premium") return "success";
  if (tier === "pro") return "info";
  return "neutral";
}

export default function RiderDataDetailPage({ params }: PageProps) {
  const { userId } = use(params);
  const typedUserId = userId as Id<"users">;
  const userDetail = useQuery(api.admin.queries.getUserDetail, { userId: typedUserId });
  const riderData = useQuery(api.admin.queries.getAdminRiderData, { userId: typedUserId });

  if (userDetail === undefined || riderData === undefined) {
    return <LoadingState label="Loading rider detail..." />;
  }

  if (!userDetail?.user) {
    return (
      <EmptyState
        title="Rider not found"
        description="The user record is no longer available in the live admin dataset."
        action={
          <Button variant="outline" render={<Link href="/admin/rider-data" />}>
            Back to riders
          </Button>
        }
      />
    );
  }

  const user = userDetail.user;
  const profile = riderData?.profile ?? null;
  const measurementFlags = (riderData?.measurementFlags ?? []).filter(
    (flag): flag is string => Boolean(flag)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Rider data</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user.displayName ?? user.name ?? user.email}
          </h1>
          <p className="mt-2 max-w-2xl text-[color:var(--muted-foreground)]">
            {user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/admin/rider-data" />}>
            Back to riders
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SharedStatusPill tone={toneForTier(user.tier)}>{user.tier ?? "free"}</SharedStatusPill>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Bikes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{userDetail.bikeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Fit runs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{userDetail.fitRunCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{measurementFlags.length}</CardContent>
        </Card>
      </div>

      <ErrorState
        title="Rider review actions are still backend-blocked"
        description="The live read model is available, but note creation, manual flagging, and queue workflow mutations are not present yet. This page is intentionally read-only until those admin endpoints exist."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Live profile snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                    <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Measurements
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>Height: {profile.heightCm ?? "n/a"} cm</div>
                      <div>Inseam: {profile.inseamCm ?? "n/a"} cm</div>
                      <div>Arm: {profile.armLengthCm ?? "n/a"} cm</div>
                      <div>Torso: {profile.torsoLengthCm ?? "n/a"} cm</div>
                      <div>Shoulders: {profile.shoulderWidthCm ?? "n/a"} cm</div>
                      <div>Weight: {profile.weightKg ?? "n/a"} kg</div>
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                    <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      Signal quality
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {measurementFlags.length > 0 ? (
                        measurementFlags.map((flag) => (
                          <SharedStatusPill key={flag} tone="warning">
                            {flag.replaceAll("_", " ")}
                          </SharedStatusPill>
                        ))
                      ) : (
                        <SharedStatusPill tone="success">No measurement flags</SharedStatusPill>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4 text-sm text-[color:var(--muted-foreground)]">
                  <div className="flex flex-wrap gap-3">
                    <span>Flexibility: {profile.flexibilityScore}</span>
                    <span>Core stability: {profile.coreStabilityScore}/5</span>
                    <span>
                      Ongoing injuries:{" "}
                      {profile.injuryHistory?.filter((injury) => injury.isOngoing).length ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No profile record"
                description="The user exists, but there is no live profile document to display yet."
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linked bikes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userDetail.bikes.length === 0 ? (
                <EmptyState
                  title="No bikes yet"
                  description="This rider has no bikes in the live dataset."
                />
              ) : (
                userDetail.bikes.map((bike) => (
                  <div
                    key={bike._id}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{bike.name}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {bike.brand ?? bike.model ?? bike.bikeType}
                        </div>
                      </div>
                      <SharedStatusPill tone={bike.geometryRecordId ? "success" : "warning"}>
                        {bike.geometryRecordId ? "geometry linked" : "no geometry"}
                      </SharedStatusPill>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fit runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userDetail.fitRuns.length === 0 ? (
                <EmptyState
                  title="No fit runs"
                  description="There are no live fit session records for this rider yet."
                />
              ) : (
                userDetail.fitRuns.map((fitRun) => (
                  <div
                    key={fitRun._id}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{fitRun.status}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {formatDateTime(fitRun.completedAt ?? fitRun.createdAt)}
                        </div>
                      </div>
                      <SharedStatusPill tone={fitRun.reviewStatus === "reviewed" ? "success" : "warning"}>
                        {fitRun.reviewStatus ?? "pending"}
                      </SharedStatusPill>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userDetail.auditLogs.length === 0 ? (
                <EmptyState
                  title="No audit logs"
                  description="This rider has no admin audit history yet."
                />
              ) : (
                userDetail.auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {formatDateTime(log.occurredAt)}
                        </div>
                      </div>
                      {log.reason ? (
                        <SharedStatusPill tone="info">reason recorded</SharedStatusPill>
                      ) : null}
                    </div>
                    {log.reason ? (
                      <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                        {log.reason}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
