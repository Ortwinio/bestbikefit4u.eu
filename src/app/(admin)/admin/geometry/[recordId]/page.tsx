"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../../../../convex/_generated/dataModel";
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
  Textarea,
} from "@/components/ui";
import { ErrorState } from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

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
  const typedRecordId = recordId as Id<"geometry_records">;
  const recordDetail = useQuery(api.admin.queries.getGeometryRecordDetail, { recordId: typedRecordId });
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const models = useQuery(
    api.admin.queries.listGeometryModels,
    recordDetail?.record ? { brandId: recordDetail.record.brandId } : "skip"
  );
  const approveRecord = useMutation(api.admin.mutations.approveGeometryRecord);
  const rejectRecord = useMutation(api.admin.mutations.rejectGeometryRecord);
  const createVersion = useMutation(api.admin.mutations.createGeometryRecordVersion);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [versionReason, setVersionReason] = useState("");
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | "version" | null>(null);

  const record = recordDetail?.record ?? null;
  const versionHistory = recordDetail?.versionHistory ?? [];
  const brand = brands?.find((item) => String(item._id) === String(record?.brandId)) ?? null;
  const model = models?.find((item) => String(item._id) === String(record?.modelId)) ?? null;

  const metrics = useMemo(() => {
    if (!record) return [];
    return [
      ["Stack", record.stack ?? "?" ],
      ["Reach", record.reach ?? "?" ],
      ["Seat tube angle", record.seatTubeAngle ?? "?" ],
      ["Head tube angle", record.headTubeAngle ?? "?" ],
      ["Wheelbase", record.wheelbase ?? "?" ],
      ["Chainstay", record.chainstay ?? "?" ],
      ["BB drop", record.bbDrop ?? "?" ],
      ["Effective top tube", record.effectiveTopTube ?? "?" ],
      ["Standover", record.standover ?? "?" ],
      ["Fork rake", record.forkRake ?? "?" ],
      ["Head tube length", record.headTubeLength ?? "?" ],
    ] as const;
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
      setRejectOpen(false);
      setRejectReason("");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleVersion() {
    setBusyAction("version");
    try {
      await createVersion({
        recordId: typedRecordId,
        changeReason: versionReason.trim() || undefined,
      });
      setVersionReason("");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Geometry record</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {brand?.name ?? "Unknown brand"} {model?.name ?? "Unknown model"}
          </h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            {record.sizeLabel} · v{record.version}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<Link href={`/admin/geometry/brands/${String(record.brandId)}/models/${String(record.modelId)}`} />}
          >
            Back to model
          </Button>
          <Button variant="success" isLoading={busyAction === "approve"} onClick={() => void handleApprove()}>
            Approve
          </Button>
          <Button variant="destructive" onClick={() => setRejectOpen(true)}>
            Reject
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SharedStatusPill tone={record.status === "active" ? "success" : record.status === "draft" ? "warning" : record.status === "rejected" ? "danger" : "neutral"}>
              {record.status}
            </SharedStatusPill>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SharedStatusPill tone="info">{record.source}</SharedStatusPill>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Reviewed by
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{record.reviewedBy ?? "Pending"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Reviewed at
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{formatDateTime(record.reviewedAt)}</CardContent>
        </Card>
      </div>

      <ErrorState
        title="Record field editing is still backend-limited"
        description="Approve, reject, and version creation are live, but there is no dedicated mutation yet to patch the geometry record fields themselves. This page is intentionally read-only for field values."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Live geometry snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {label}
                </div>
                <div className="mt-2 text-sm">{String(value)}</div>
              </div>
            ))}
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
              <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Source URL
              </div>
              <div className="mt-2 text-sm">{record.sourceUrl ?? "Not set"}</div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
              <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Change reason
              </div>
              <div className="mt-2 text-sm">{record.changeReason ?? "Not set"}</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {versionHistory.map((item) => (
                <div
                  key={String(item._id)}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3 text-sm"
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

          <Card>
            <CardHeader>
              <CardTitle>Release actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-[color:var(--muted-foreground)]">
                Create a new version before applying additional manual changes.
              </div>
              <Input
                label="Version change reason"
                value={versionReason}
                onChange={(event) => setVersionReason(event.target.value)}
                placeholder="Optional reason"
              />
              <Button isLoading={busyAction === "version"} onClick={() => void handleVersion()}>
                Create new version
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AccessibleDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject geometry record"
        description="Rejecting moves the record out of the active flow and writes an audit entry."
      >
        <div className="space-y-3">
          <Textarea
            label="Reason"
            rows={4}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Explain why this record is rejected"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={busyAction === "reject"}
              onClick={() => void handleReject()}
            >
              Reject record
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}
