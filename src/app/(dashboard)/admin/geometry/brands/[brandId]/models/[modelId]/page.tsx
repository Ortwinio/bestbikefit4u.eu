"use client";

import Link from "next/link";
import { use, useState } from "react";
import { api } from "../../../../../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../../../../../../../convex/_generated/dataModel";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  LoadingState,
  NumberInput,
  Select,
  Textarea,
} from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

interface PageProps {
  params: Promise<{ brandId: string; modelId: string }>;
}

export default function GeometryModelPage({ params }: PageProps) {
  const { brandId, modelId } = use(params);
  const typedBrandId = brandId as Id<"geometry_brands">;
  const typedModelId = modelId as Id<"geometry_models">;
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const models = useQuery(
    api.admin.queries.listGeometryModels,
    typedBrandId ? { brandId: typedBrandId } : "skip"
  );
  const records = useQuery(
    api.admin.queries.listGeometryRecords,
    typedModelId ? { modelId: typedModelId } : "skip"
  );
  const createRecord = useMutation(api.admin.mutations.createGeometryRecord);
  const [showDialog, setShowDialog] = useState(false);
  const [sizeLabel, setSizeLabel] = useState("");
  const [source, setSource] = useState("manufacturer");
  const [sourceUrl, setSourceUrl] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [stack, setStack] = useState<number | null>(null);
  const [reach, setReach] = useState<number | null>(null);
  const [seatTubeAngle, setSeatTubeAngle] = useState<number | null>(null);
  const [headTubeAngle, setHeadTubeAngle] = useState<number | null>(null);
  const [wheelbase, setWheelbase] = useState<number | null>(null);
  const [chainstay, setChainstay] = useState<number | null>(null);
  const [bbDrop, setBbDrop] = useState<number | null>(null);
  const [effectiveTopTube, setEffectiveTopTube] = useState<number | null>(null);
  const [standover, setStandover] = useState<number | null>(null);
  const [forkRake, setForkRake] = useState<number | null>(null);
  const [headTubeLength, setHeadTubeLength] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const brand = brands?.find((item) => String(item._id) === brandId) ?? null;
  const model = models?.find((item) => String(item._id) === modelId) ?? null;

  if (brands === undefined || models === undefined || records === undefined) {
    return <LoadingState label="Loading geometry model..." />;
  }

  if (!brand || !model) {
    return (
      <EmptyState
        title="Model not found"
        description="The requested model is no longer present in the live geometry library."
        action={
          <Button variant="outline" render={<Link href={`/admin/geometry/brands/${brandId}`} />}>
            Back to brand
          </Button>
        }
      />
    );
  }

  async function handleCreateRecord() {
    setIsSaving(true);
    try {
      await createRecord({
        brandId: typedBrandId,
        modelId: typedModelId,
        sizeLabel,
        source: source as
          | "manufacturer"
          | "admin_import"
          | "admin_manual"
          | "user_entered",
        sourceUrl: sourceUrl.trim() || undefined,
        changeReason: changeReason.trim() || undefined,
        stack: stack ?? undefined,
        reach: reach ?? undefined,
        seatTubeAngle: seatTubeAngle ?? undefined,
        headTubeAngle: headTubeAngle ?? undefined,
        wheelbase: wheelbase ?? undefined,
        chainstay: chainstay ?? undefined,
        bbDrop: bbDrop ?? undefined,
        effectiveTopTube: effectiveTopTube ?? undefined,
        standover: standover ?? undefined,
        forkRake: forkRake ?? undefined,
        headTubeLength: headTubeLength ?? undefined,
      });
      setShowDialog(false);
      setSizeLabel("");
      setSource("manufacturer");
      setSourceUrl("");
      setChangeReason("");
      setStack(null);
      setReach(null);
      setSeatTubeAngle(null);
      setHeadTubeAngle(null);
      setWheelbase(null);
      setChainstay(null);
      setBbDrop(null);
      setEffectiveTopTube(null);
      setStandover(null);
      setForkRake(null);
      setHeadTubeLength(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Model detail</div>
          <h1 className="text-3xl font-semibold tracking-tight">{model.name}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            {brand.name} · {model.notes ?? "No notes"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/admin/geometry/brands/${brandId}`} />}>
            Back
          </Button>
          <Button onClick={() => setShowDialog(true)}>New size record</Button>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="No size records yet"
          description="Create the first live size record for this model."
          action={<Button onClick={() => setShowDialog(true)}>Create size record</Button>}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Live size records</CardTitle>
          </CardHeader>
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
                  <tr key={String(record._id)} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4">
                      <div className="font-medium">{record.sizeLabel}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">
                        v{record.version}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {record.stack ?? "?"} / {record.reach ?? "?"}
                    </td>
                    <td className="px-4 py-4">
                      {record.seatTubeAngle ?? "?"} / {record.headTubeAngle ?? "?"}
                    </td>
                    <td className="px-4 py-4">
                      <SharedStatusPill tone={record.status === "active" ? "success" : "warning"}>
                        {record.status}
                      </SharedStatusPill>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/geometry/${String(record._id)}`} />}
                      >
                        Edit record
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <AccessibleDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Create size record"
        description="This writes a live geometry record in Convex."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Size label"
            value={sizeLabel}
            onChange={(event) => setSizeLabel(event.target.value)}
            placeholder="54"
          />
          <Select
            label="Source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            options={[
              { value: "manufacturer", label: "Manufacturer" },
              { value: "admin_import", label: "Admin import" },
              { value: "admin_manual", label: "Admin manual" },
              { value: "user_entered", label: "User entered" },
            ]}
          />
          <Input
            label="Source URL"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://example.com"
          />
          <Input
            label="Change reason"
            value={changeReason}
            onChange={(event) => setChangeReason(event.target.value)}
            placeholder="Why this record exists"
          />
          <NumberInput label="Stack" value={stack} onChange={setStack} />
          <NumberInput label="Reach" value={reach} onChange={setReach} />
          <NumberInput label="Seat tube angle" value={seatTubeAngle} onChange={setSeatTubeAngle} />
          <NumberInput label="Head tube angle" value={headTubeAngle} onChange={setHeadTubeAngle} />
          <NumberInput label="Wheelbase" value={wheelbase} onChange={setWheelbase} />
          <NumberInput label="Chainstay" value={chainstay} onChange={setChainstay} />
          <NumberInput label="BB drop" value={bbDrop} onChange={setBbDrop} />
          <NumberInput label="Effective top tube" value={effectiveTopTube} onChange={setEffectiveTopTube} />
          <NumberInput label="Standover" value={standover} onChange={setStandover} />
          <NumberInput label="Fork rake" value={forkRake} onChange={setForkRake} />
          <NumberInput label="Head tube length" value={headTubeLength} onChange={setHeadTubeLength} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button isLoading={isSaving} disabled={!sizeLabel.trim()} onClick={() => void handleCreateRecord()}>
            Create record
          </Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}
