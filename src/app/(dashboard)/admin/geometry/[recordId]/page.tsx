"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
import {
  buildGeometryRecordCreateArgs,
  createGeometryRecordDraft,
  getNextGeometryVersion,
  geometryMeasurementFields,
  type GeometryRecordDraft,
} from "../geometry-record-utils";

interface PageProps {
  params: Promise<{ recordId: string }>;
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

export default function GeometryRecordPage({ params }: PageProps) {
  const { recordId } = use(params);
  const router = useRouter();
  const typedRecordId = recordId as Id<"geometry_records">;
  const recordDetail = useQuery(api.admin.queries.getGeometryRecordDetail, { recordId: typedRecordId });
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const models = useQuery(
    api.admin.queries.listGeometryModels,
    recordDetail?.record ? { brandId: recordDetail.record.brandId } : "skip"
  );
  const approveRecord = useMutation(api.admin.mutations.approveGeometryRecord);
  const rejectRecord = useMutation(api.admin.mutations.rejectGeometryRecord);
  const saveGeometryRecordVersion = useMutation(api.admin.mutations.saveGeometryRecordVersion);
  const [draft, setDraft] = useState<GeometryRecordDraft | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | "save" | null>(null);

  const record = recordDetail?.record ?? null;
  const versionHistory = recordDetail?.versionHistory ?? [];
  const brand = brands?.find((item) => String(item._id) === String(record?.brandId)) ?? null;
  const model = models?.find((item) => String(item._id) === String(record?.modelId)) ?? null;
  const nextVersion = getNextGeometryVersion(versionHistory);

  useEffect(() => {
    if (!record) {
      return;
    }

    setDraft(createGeometryRecordDraft(record));
    setRejectReason("");
  }, [record]);

  if (recordDetail === undefined || brands === undefined) {
    return <LoadingState label="Loading geometry record..." />;
  }

  if (!record) {
    return (
      <EmptyState
        title="Record not found"
        description="The requested geometry record is no longer present."
        action={
          <Button variant="outline" render={<Link href="/admin/geometry/brands" />}>
            Back to geometry
          </Button>
        }
      />
    );
  }

  if (!draft) {
    return <LoadingState label="Preparing geometry editor..." />;
  }

  const geometryRecord = record;
  const geometryDraft = draft;

  function updateDraft<K extends keyof GeometryRecordDraft>(key: K, value: GeometryRecordDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleApprove() {
    setBusyAction("approve");
    try {
      await approveRecord({ recordId: typedRecordId });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReject() {
    setBusyAction("reject");
    try {
      await rejectRecord({
        recordId: typedRecordId,
        reason: rejectReason.trim() || undefined,
      });
      setRejectReason("");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSaveVersion() {
    const changeReason = geometryDraft.changeReason.trim();
    if (!changeReason) {
      return;
    }

    setBusyAction("save");
    try {
      const nextVersionArgs = buildGeometryRecordCreateArgs({
        brandId: geometryRecord.brandId,
        modelId: geometryRecord.modelId,
        sizeLabel: geometryRecord.sizeLabel,
        draft: {
          ...geometryDraft,
          changeReason,
        },
      });
      const newRecordId = await saveGeometryRecordVersion({
        recordId: typedRecordId,
        source: nextVersionArgs.source,
        sourceUrl: nextVersionArgs.sourceUrl,
        changeReason,
        stack: nextVersionArgs.stack,
        reach: nextVersionArgs.reach,
        seatTubeAngle: nextVersionArgs.seatTubeAngle,
        headTubeAngle: nextVersionArgs.headTubeAngle,
        wheelbase: nextVersionArgs.wheelbase,
        chainstay: nextVersionArgs.chainstay,
        bbDrop: nextVersionArgs.bbDrop,
        effectiveTopTube: nextVersionArgs.effectiveTopTube,
        standover: nextVersionArgs.standover,
        forkRake: nextVersionArgs.forkRake,
        headTubeLength: nextVersionArgs.headTubeLength,
      });
      router.replace(`/admin/geometry/${String(newRecordId)}`);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Geometry record editor</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {brand?.name ?? "Unknown brand"} {model?.name ?? "Unknown model"}
          </h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            {geometryRecord.sizeLabel} · v{geometryRecord.version}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={
              <Link
                href={`/admin/geometry/brands/${String(geometryRecord.brandId)}/models/${String(geometryRecord.modelId)}`}
              />
            }
          >
            Back to model
          </Button>
          <Button variant="success" isLoading={busyAction === "approve"} onClick={() => void handleApprove()}>
            Approve
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SharedStatusPill
              tone={
                geometryRecord.status === "active"
                  ? "success"
                  : geometryRecord.status === "draft"
                    ? "warning"
                    : geometryRecord.status === "rejected"
                      ? "danger"
                      : "neutral"
              }
            >
              {geometryRecord.status}
            </SharedStatusPill>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm font-medium">Current v{geometryRecord.version}</div>
              <div className="text-xs text-[color:var(--muted-foreground)]">
                Next save becomes v{nextVersion}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SharedStatusPill tone="info">{geometryRecord.source}</SharedStatusPill>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>{geometryRecord.reviewedBy ?? "Pending"}</div>
            <div className="text-xs text-[color:var(--muted-foreground)]">
              {formatDateTime(geometryRecord.reviewedAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Geometry editor</CardTitle>
            <CardDescription>
              Edit the live measurements and save them as the next version in this size-label chain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card variant="bordered" className="bg-[color:var(--secondary)]">
                <CardHeader>
                  <CardTitle className="text-base">Record identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                        Brand
                      </div>
                      <div className="mt-1 text-sm">{brand?.name ?? "Unknown brand"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                        Model
                      </div>
                      <div className="mt-1 text-sm">{model?.name ?? "Unknown model"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                        Size label
                      </div>
                      <div className="mt-1 text-sm">{geometryRecord.sizeLabel}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                        Current version
                      </div>
                      <div className="mt-1 text-sm">v{geometryRecord.version}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="bordered" className="bg-[color:var(--secondary)]">
                <CardHeader>
                  <CardTitle className="text-base">Versioning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                    Saving these fields creates a new draft record in the same size-label chain.
                    Keep the change reason specific so the audit trail explains why the version exists.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <SharedStatusPill tone="info">Next version v{nextVersion}</SharedStatusPill>
                    <SharedStatusPill tone={geometryRecord.status === "active" ? "success" : "warning"}>
                      {geometryRecord.status}
                    </SharedStatusPill>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Source URL"
                value={geometryDraft.sourceUrl}
                onChange={(event) => updateDraft("sourceUrl", event.target.value)}
                placeholder="https://example.com"
              />
              <Select
                label="Source"
                value={geometryDraft.source}
                onChange={(event) =>
                  updateDraft("source", event.currentTarget.value as GeometryRecordDraft["source"])
                }
                options={[
                  { value: "manufacturer", label: "Manufacturer" },
                  { value: "admin_import", label: "Admin import" },
                  { value: "admin_manual", label: "Admin manual" },
                  { value: "user_entered", label: "User entered" },
                ]}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {geometryMeasurementFields.map((field) => (
                <NumberInput
                  key={field.key}
                  label={field.label}
                  value={geometryDraft[field.key]}
                  unit={field.unit}
                  onChange={(nextValue) => updateDraft(field.key, nextValue)}
                />
              ))}
            </div>

            <Textarea
              label="Change reason"
              rows={4}
              value={geometryDraft.changeReason}
              onChange={(event) => updateDraft("changeReason", event.target.value)}
              placeholder="Describe the measurement change or correction"
              helperText="Required before saving the next version."
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDraft(createGeometryRecordDraft(geometryRecord))}
                disabled={busyAction === "save"}
              >
                Reset draft
              </Button>
              <Button
                isLoading={busyAction === "save"}
                disabled={!geometryDraft.changeReason.trim()}
                onClick={() => void handleSaveVersion()}
              >
                Save new version
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Approval</CardTitle>
              <CardDescription>
                Approve or reject the current record. Rejection remains inline to avoid popup-only flows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="success" isLoading={busyAction === "approve"} onClick={() => void handleApprove()}>
                Approve record
              </Button>
              <Textarea
                label="Reject reason"
                rows={4}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Explain why this record is rejected"
                helperText="Optional, but recommended for audit clarity."
              />
              <Button
                variant="destructive"
                isLoading={busyAction === "reject"}
                onClick={() => void handleReject()}
              >
                Reject record
              </Button>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
            <CardTitle>Version history</CardTitle>
            <CardDescription>
                Live records for {geometryRecord.sizeLabel}. The newest version appears first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {versionHistory.map((item) => (
                <div
                  key={String(item._id)}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">v{item.version}</div>
                    <SharedStatusPill tone={item.status === "active" ? "success" : "warning"}>
                      {item.status}
                    </SharedStatusPill>
                  </div>
                  <div className="mt-1 text-[color:var(--muted-foreground)]">
                    {item.changeReason ?? "No change reason"}
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                    {formatDateTime(item.reviewedAt)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
