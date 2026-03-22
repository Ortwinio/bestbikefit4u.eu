"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminGeometryRecords, getGeometryBrand, getGeometryModel } from "@/components/admin/contracts";

interface PageProps {
  params: Promise<{ recordId: string }>;
}

export default function GeometryRecordPage({ params }: PageProps) {
  const { recordId } = use(params);
  const record = adminGeometryRecords.find((item) => item.recordId === recordId) ?? adminGeometryRecords[0];
  const brand = getGeometryBrand(record.brandId);
  const model = getGeometryModel(record.modelId);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const versionHistory = useMemo(
    () => adminGeometryRecords.filter((item) => item.modelId === record.modelId && item.sizeLabel === record.sizeLabel),
    [record.modelId, record.sizeLabel]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Geometry record</div>
          <h1 className="text-3xl font-semibold tracking-tight">{brand?.name} {model?.name}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">{record.sizeLabel} - v{record.version}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/admin/geometry/brands/${record.brandId}/models/${record.modelId}`} />}>Back to model</Button>
          <Button onClick={() => setShowApproveDialog(true)}>Approve</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Geometry form</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input label="Size label" value={record.sizeLabel} onChange={() => {}} />
            <Select
              label="Source"
              value={record.source}
              onChange={() => {}}
              options={[
                { value: "manufacturer", label: "Manufacturer" },
                { value: "admin_import", label: "Admin import" },
                { value: "admin_manual", label: "Admin manual" },
                { value: "user_entered", label: "User entered" },
              ]}
            />
            <NumberInput label="Stack" value={record.stack} onChange={() => {}} />
            <NumberInput label="Reach" value={record.reach} onChange={() => {}} />
            <NumberInput label="Seat tube angle" value={record.seatTubeAngle} onChange={() => {}} />
            <NumberInput label="Head tube angle" value={record.headTubeAngle} onChange={() => {}} />
            <NumberInput label="Wheelbase" value={record.wheelbase} onChange={() => {}} />
            <NumberInput label="Chainstay" value={record.chainstay} onChange={() => {}} />
            <NumberInput label="BB drop" value={record.bbDrop} onChange={() => {}} />
            <NumberInput label="Effective top tube" value={record.effectiveTopTube} onChange={() => {}} />
            <NumberInput label="Standover" value={record.standover} onChange={() => {}} />
            <NumberInput label="Fork rake" value={record.forkRake} onChange={() => {}} />
            <NumberInput label="Head tube length" value={record.headTubeLength} onChange={() => {}} />
            <Textarea label="Change reason" rows={4} value={record.changeReason ?? ""} onChange={() => {}} />
            <Input label="Source URL" value={record.sourceUrl ?? ""} onChange={() => {}} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <StatusPill tone={record.status === "active" ? "success" : record.status === "draft" ? "warning" : record.status === "rejected" ? "danger" : "neutral"}>
                {record.status}
              </StatusPill>
              <div>Reviewed by: {record.reviewedBy ?? "unassigned"}</div>
              <div>Reviewed at: {record.reviewedAt ?? "pending"}</div>
              <div>Source: {record.source}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Version history</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {versionHistory.map((item) => (
                <div key={item.recordId} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">v{item.version}</div>
                    <StatusPill tone={item.status === "active" ? "success" : "warning"}>{item.status}</StatusPill>
                  </div>
                  <div className="mt-1 text-[color:var(--muted-foreground)]">{item.changeReason ?? "No change reason"}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>Save draft</Button>
        <Button variant="outline">Reject</Button>
        <Button variant="ghost">Create new version</Button>
      </div>

      <AccessibleDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        title="Approve geometry record"
        description="This UI is ready for the Convex mutation when the backend lands."
      >
        <div className="space-y-3">
          <Input label="Reason" placeholder="Approval reason" />
          <Button onClick={() => setShowApproveDialog(false)}>Confirm locally</Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}

