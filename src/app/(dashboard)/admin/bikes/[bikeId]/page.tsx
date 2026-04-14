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
import { AdminBikeGeometryLinkDialog } from "@/components/admin/bikes/AdminBikeGeometryLinkDialog";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

interface PageProps {
  params: Promise<{ bikeId: string }>;
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

export default function BikeDetailPage({ params }: PageProps) {
  const { bikeId } = use(params);
  const typedBikeId = bikeId as Id<"bikes">;
  const bikeDetail = useQuery(api.admin.queries.getAdminBikeDetail, { bikeId: typedBikeId });

  const currentBike = bikeDetail?.bike ?? null;
  const currentRecord = bikeDetail?.geometryRecord ?? null;
  const owner = bikeDetail?.owner ?? null;

  if (bikeDetail === undefined) {
    return <LoadingState label="Loading bike detail..." />;
  }

  if (!currentBike) {
    return (
      <EmptyState
        title="Bike not found"
        description="The live bike record is no longer available."
        action={
          <Button variant="outline" render={<Link href="/admin/bikes" />}>
            Back to bikes
          </Button>
        }
      />
    );
  }

  const fitRuns = bikeDetail?.fitRuns ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Bike detail</div>
          <h1 className="text-3xl font-semibold tracking-tight">{currentBike.name}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            {currentBike.brand ?? "No brand"} / {currentBike.model ?? "No model"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/admin/bikes" />}>
            Back to bikes
          </Button>
          <AdminBikeGeometryLinkDialog
            bikeId={typedBikeId}
            currentRecord={currentRecord}
            buttonLabel={currentRecord ? "Re-link geometry" : "Link geometry"}
            buttonSize="md"
            buttonVariant="primary"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SharedStatusPill tone="info">{currentBike.bikeType}</SharedStatusPill>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Fit runs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{fitRuns.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Geometry
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentRecord ? (
              <SharedStatusPill tone={currentRecord.status === "active" ? "success" : "warning"}>
                {currentRecord.sizeLabel} v{currentRecord.version}
              </SharedStatusPill>
            ) : (
              <SharedStatusPill tone="warning">unlinked</SharedStatusPill>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Created
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{formatDateTime(currentBike.createdAt)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Identity
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>Owner</span>
                    <span>{owner?.displayName ?? owner?.name ?? owner?.email ?? "Unknown"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Category</span>
                    <span>{currentBike.bikeType}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Notes</span>
                    <span>{currentBike.notes ?? "None"}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Live geometry link
                </div>
                {currentRecord ? (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span>Record</span>
                      <span>{currentRecord.sizeLabel}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Version</span>
                      <span>v{currentRecord.version}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Status</span>
                      <SharedStatusPill tone={currentRecord.status === "active" ? "success" : "warning"}>
                        {currentRecord.status}
                      </SharedStatusPill>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No geometry linked"
                    description="Use the live geometry picker to attach a record."
                    className="mt-3 p-4"
                  />
                )}
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
              <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Fit sessions
              </div>
              <div className="mt-3 space-y-3">
                {fitRuns.length === 0 ? (
                  <EmptyState
                    title="No fit sessions"
                    description="This bike has no live fit session history."
                  />
                ) : (
                  fitRuns.map((session) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3 text-sm"
                    >
                      <div>
                        <div className="font-medium">{session.status}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {formatDateTime(session.completedAt ?? session.createdAt)}
                        </div>
                      </div>
                      <SharedStatusPill tone={session.reviewStatus === "reviewed" ? "success" : "warning"}>
                        {session.reviewStatus ?? "pending"}
                      </SharedStatusPill>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link geometry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EmptyState
              title="Live link action"
              description="Linking a geometry record updates the bike document in Convex."
              className="p-4 text-left"
            />
            <div className="text-sm text-[color:var(--muted-foreground)]">
              If this bike already has a geometry link, the new selection will replace it.
            </div>
            <AdminBikeGeometryLinkDialog
              bikeId={typedBikeId}
              currentRecord={currentRecord}
              buttonLabel="Open geometry picker"
              buttonSize="md"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
