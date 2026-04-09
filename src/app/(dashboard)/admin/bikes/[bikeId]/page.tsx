"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
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
  LoadingState,
  Select,
} from "@/components/ui";
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
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const linkBikeToGeometry = useMutation(api.admin.mutations.linkBikeToGeometry);

  const currentBike = bikeDetail?.bike ?? null;
  const currentRecord = bikeDetail?.geometryRecord ?? null;
  const owner = bikeDetail?.owner ?? null;

  const initialBrandId = currentRecord ? String(currentRecord.brandId) : "";
  const initialModelId = currentRecord ? String(currentRecord.modelId) : "";
  const initialRecordId = currentRecord ? String(currentRecord._id) : "";

  useEffect(() => {
    if (!linkOpen) return;
    if (!selectedBrandId && initialBrandId) {
      setSelectedBrandId(initialBrandId);
    }
    if (!selectedModelId && initialModelId) {
      setSelectedModelId(initialModelId);
    }
    if (!selectedRecordId && initialRecordId) {
      setSelectedRecordId(initialRecordId);
    }
  }, [initialBrandId, initialModelId, initialRecordId, linkOpen, selectedBrandId, selectedModelId, selectedRecordId]);

  const activeBrandId = selectedBrandId || initialBrandId || String(brands?.[0]?._id ?? "");
  const brandModels = useQuery(
    api.admin.queries.listGeometryModels,
    activeBrandId ? { brandId: activeBrandId as Id<"geometry_brands"> } : "skip"
  );

  const activeModelId =
    selectedModelId || initialModelId || String(brandModels?.[0]?._id ?? "");
  const modelRecords = useQuery(
    api.admin.queries.listGeometryRecords,
    activeModelId ? { modelId: activeModelId as Id<"geometry_models"> } : "skip"
  );

  useEffect(() => {
    if (!linkOpen) return;
    if (!selectedModelId && brandModels?.[0]?._id) {
      setSelectedModelId(String(brandModels[0]._id));
    }
    if (!selectedRecordId && modelRecords?.[0]?._id) {
      setSelectedRecordId(String(modelRecords[0]._id));
    }
  }, [brandModels, linkOpen, modelRecords, selectedModelId, selectedRecordId]);

  const selectedRecord = useMemo(() => {
    return modelRecords?.find((record) => String(record._id) === selectedRecordId) ?? null;
  }, [modelRecords, selectedRecordId]);

  if (bikeDetail === undefined || brands === undefined) {
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

  async function handleLinkGeometry() {
    if (!selectedRecord) return;
    setIsLinking(true);
    try {
      await linkBikeToGeometry({ bikeId: typedBikeId, recordId: selectedRecord._id });
      setLinkOpen(false);
    } finally {
      setIsLinking(false);
    }
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
          <Button onClick={() => setLinkOpen(true)}>Link geometry</Button>
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
            <Button onClick={() => setLinkOpen(true)}>Open geometry picker</Button>
          </CardContent>
        </Card>
      </div>

      <AccessibleDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Link geometry record"
        description="Choose a brand, model, and size record from the live geometry library."
      >
        <div className="space-y-4">
          <Select
            label="Brand"
            value={selectedBrandId || initialBrandId}
            onChange={(event) => {
              setSelectedBrandId(event.target.value);
              setSelectedModelId("");
              setSelectedRecordId("");
            }}
            options={[
              { value: "", label: "Select a brand", disabled: true },
              ...(brands ?? []).map((brand) => ({
                value: String(brand._id),
                label: brand.name,
              })),
            ]}
          />
          <Select
            label="Model"
            value={selectedModelId || initialModelId}
            onChange={(event) => {
              setSelectedModelId(event.target.value);
              setSelectedRecordId("");
            }}
            options={[
              { value: "", label: "Select a model", disabled: true },
              ...(brandModels ?? []).map((model) => ({
                value: String(model._id),
                label: model.name,
              })),
            ]}
          />
          <Select
            label="Record"
            value={selectedRecordId || initialRecordId}
            onChange={(event) => setSelectedRecordId(event.target.value)}
            options={[
              { value: "", label: "Select a record", disabled: true },
              ...(modelRecords ?? []).map((record) => ({
                value: String(record._id),
                label: `${record.sizeLabel} v${record.version} (${record.status})`,
              })),
            ]}
          />
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4 text-sm text-[color:var(--muted-foreground)]">
            {selectedRecord
              ? `Selected record ${selectedRecord.sizeLabel} v${selectedRecord.version} will replace the current link.`
              : "Select a record to enable the link action."}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={isLinking}
              disabled={!selectedRecord}
              onClick={() => void handleLinkGeometry()}
            >
              Link record
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}
