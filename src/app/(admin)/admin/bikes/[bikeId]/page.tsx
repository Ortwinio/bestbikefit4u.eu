"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminBikeRecords, adminGeometryRecords } from "@/components/admin/contracts";

interface PageProps {
  params: Promise<{ bikeId: string }>;
}

export default function BikeDetailPage({ params }: PageProps) {
  const { bikeId } = use(params);
  const bike = adminBikeRecords.find((item) => item.bikeId === bikeId) ?? adminBikeRecords[0];
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [geometryId, setGeometryId] = useState(bike.geometryRecordId ?? "");

  const geometryOptions = useMemo(
    () =>
      adminGeometryRecords.map((record) => ({
        value: record.recordId,
        label: `${record.modelName} ${record.sizeLabel} v${record.version} (${record.status})`,
      })),
    []
  );

  const linkedGeometry = adminGeometryRecords.find((record) => record.recordId === geometryId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Bike detail</div>
          <h1 className="text-3xl font-semibold tracking-tight">{bike.brand} {bike.model}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">Owner: {bike.ownerName} ({bike.ownerEmail})</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/bikes" />}>Back to list</Button>
          <Button onClick={() => setShowLinkDialog(true)}>Link geometry</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current setup</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
              <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">Identity</div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between"><span>Category</span><StatusPill>{bike.category}</StatusPill></div>
                <div className="flex justify-between"><span>Size</span><span>{bike.size}</span></div>
                <div className="flex justify-between"><span>Created</span><span>{bike.createdAt}</span></div>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
              <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">Geometry link</div>
              {linkedGeometry ? (
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Record</span><span>{linkedGeometry.modelName}</span></div>
                  <div className="flex justify-between"><span>Size label</span><span>{linkedGeometry.sizeLabel}</span></div>
                  <div className="flex justify-between"><span>Status</span><StatusPill tone={linkedGeometry.status === "active" ? "success" : "warning"}>{linkedGeometry.status}</StatusPill></div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">No geometry record linked yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--muted-foreground)]">
              <p>Expected backend contracts: `getAdminBikeDetail` and `linkBikeToGeometry`.</p>
              <p>The page is read-only until those admin mutations are wired.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fit sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { id: "fit_01", date: "2026-03-20", status: "completed" },
                { id: "fit_02", date: "2026-02-11", status: "questionnaire_complete" },
              ].map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3">
                  <div>
                    <div className="font-medium">{session.id}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)]">{session.date}</div>
                  </div>
                  <StatusPill tone={session.status === "completed" ? "success" : "warning"}>{session.status}</StatusPill>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <AccessibleDialog
        open={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        title="Link geometry record"
        description="Select a geometry record from the contract-shaped preview list."
      >
        <div className="space-y-4">
          <Select
            value={geometryId}
            onChange={(event) => setGeometryId(event.target.value)}
            options={geometryOptions}
          />
          <Input label="Search record" placeholder="Search by model or size" />
          <Button onClick={() => setShowLinkDialog(false)}>Save locally</Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}

