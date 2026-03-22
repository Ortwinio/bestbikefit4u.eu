"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminRiderRecords } from "@/components/admin/contracts";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function RiderDataDetailPage({ params }: PageProps) {
  const { userId } = use(params);
  const record = adminRiderRecords.find((item) => item.userId === userId) ?? adminRiderRecords[0];
  const [notes, setNotes] = useState(record.notes);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Rider data</div>
          <h1 className="text-3xl font-semibold tracking-tight">{record.name}</h1>
          <p className="mt-2 max-w-2xl text-[color:var(--muted-foreground)]">{record.profileSummary}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/rider-data" />}>Back to queue</Button>
          <Button onClick={() => setShowFlagDialog(true)}>Flag for review</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Measurement snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">Profile</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Email</span><span>{record.email}</span></div>
                  <div className="flex justify-between"><span>Plan</span><StatusPill tone={record.plan === "premium" ? "success" : record.plan === "pro" ? "info" : "neutral"}>{record.plan}</StatusPill></div>
                  <div className="flex justify-between"><span>Bikes</span><span>{record.bikeCount}</span></div>
                  <div className="flex justify-between"><span>Fit runs</span><span>{record.fitRunCount}</span></div>
                </div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">Measurements</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>Height: {record.heightCm} cm</div>
                  <div>Inseam: {record.inseamCm} cm</div>
                  <div>Arm: {record.armLengthCm} cm</div>
                  <div>Torso: {record.torsoLengthCm} cm</div>
                  <div>Shoulders: {record.shoulderWidthCm} cm</div>
                  <div>Weight: {record.weightKg} kg</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-sm font-medium">Admin notes</div>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline">Save notes locally</Button>
              <Button variant="ghost">Mark reviewed</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review flags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {record.flags.map((flag) => (
                <StatusPill key={flag} tone={flag === "needs_manual_review" ? "warning" : flag === "measurement_outlier" ? "danger" : "info"}>
                  {flag.replaceAll("_", " ")}
                </StatusPill>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit trail contract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--muted-foreground)]">
              <p>This page is contract-shaped until `getAdminRiderData` and `listAuditLogs` land.</p>
              <p>Expected backend: user detail, measurement flags, fit history, bikes, integrations, and audit logs.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AccessibleDialog
        open={showFlagDialog}
        title="Flag rider for manual review"
        description="This is a UI stub until the Convex admin mutation is wired."
        onClose={() => setShowFlagDialog(false)}
      >
        <div className="space-y-3">
          <Input label="Reason" placeholder="Describe why this rider needs manual review" />
          <Button onClick={() => setShowFlagDialog(false)}>Confirm locally</Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}

