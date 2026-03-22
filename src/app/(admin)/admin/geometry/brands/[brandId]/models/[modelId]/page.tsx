"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminGeometryModels, adminGeometryRecords } from "@/components/admin/contracts";

interface PageProps {
  params: Promise<{ brandId: string; modelId: string }>;
}

export default function GeometryModelPage({ params }: PageProps) {
  const { modelId, brandId } = use(params);
  const model = adminGeometryModels.find((item) => item.modelId === modelId) ?? adminGeometryModels[0];
  const records = adminGeometryRecords.filter((item) => item.modelId === model.modelId);
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Model detail</div>
          <h1 className="text-3xl font-semibold tracking-tight">{model.name}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">{model.notes}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/admin/geometry/brands/${brandId}`} />}>Back</Button>
          <Button onClick={() => setShowDialog(true)}>New size record</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Size records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Stack / Reach</th>
                <th className="px-4 py-3 font-medium">Angles</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.recordId} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-4">
                    <div className="font-medium">{record.sizeLabel}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)]">v{record.version}</div>
                  </td>
                  <td className="px-4 py-4">{record.stack} / {record.reach}</td>
                  <td className="px-4 py-4">{record.seatTubeAngle} / {record.headTubeAngle}</td>
                  <td className="px-4 py-4">
                    <StatusPill tone={record.status === "active" ? "success" : record.status === "draft" ? "warning" : "neutral"}>
                      {record.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="outline" size="sm" render={<Link href={`/admin/geometry/${record.recordId}`} />}>
                      View/Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AccessibleDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Create size record"
        description="A full-page form is planned later; this local dialog proves the contract."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Size label" placeholder="54" />
          <Input label="Source URL" placeholder="https://example.com" />
          <NumberInput label="Stack" value={580} onChange={() => {}} />
          <NumberInput label="Reach" value={390} onChange={() => {}} />
          <NumberInput label="Seat tube angle" value={73.5} onChange={() => {}} />
          <NumberInput label="Head tube angle" value={73.0} onChange={() => {}} />
          <Select
            label="Source"
            value="admin_manual"
            onChange={() => {}}
            options={[
              { value: "manufacturer", label: "Manufacturer" },
              { value: "admin_import", label: "Admin import" },
              { value: "admin_manual", label: "Admin manual" },
              { value: "user_entered", label: "User entered" },
            ]}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setShowDialog(false)}>Save locally</Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}

