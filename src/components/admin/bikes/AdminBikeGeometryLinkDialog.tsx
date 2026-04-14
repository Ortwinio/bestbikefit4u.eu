"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { AccessibleDialog, Button, Select, useToast } from "@/components/ui";

type GeometryRecordSummary = {
  _id: Id<"geometry_records">;
  brandId: Id<"geometry_brands">;
  modelId: Id<"geometry_models">;
  sizeLabel: string;
  version: number;
  status: string;
};

export function AdminBikeGeometryLinkDialog({
  bikeId,
  currentRecord,
  buttonLabel,
  buttonSize = "sm",
  buttonVariant = "outline",
}: {
  bikeId: Id<"bikes">;
  currentRecord?: GeometryRecordSummary | null;
  buttonLabel?: string;
  buttonSize?: "sm" | "md" | "lg" | "icon";
  buttonVariant?: "primary" | "outline" | "secondary" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const toast = useToast();
  const linkBikeToGeometry = useMutation(api.admin.mutations.linkBikeToGeometry);

  const brands = useQuery(api.admin.queries.listGeometryBrands, open ? {} : "skip");
  const initialBrandId = currentRecord ? String(currentRecord.brandId) : "";
  const initialModelId = currentRecord ? String(currentRecord.modelId) : "";
  const initialRecordId = currentRecord ? String(currentRecord._id) : "";

  useEffect(() => {
    if (!open) return;
    setSelectedBrandId(initialBrandId);
    setSelectedModelId(initialModelId);
    setSelectedRecordId(initialRecordId);
  }, [initialBrandId, initialModelId, initialRecordId, open]);

  const activeBrandId = selectedBrandId || initialBrandId || String(brands?.[0]?._id ?? "");
  const brandModels = useQuery(
    api.admin.queries.listGeometryModels,
    open && activeBrandId ? { brandId: activeBrandId as Id<"geometry_brands"> } : "skip"
  );

  const activeModelId = selectedModelId || initialModelId || String(brandModels?.[0]?._id ?? "");
  const modelRecords = useQuery(
    api.admin.queries.listGeometryRecords,
    open && activeModelId ? { modelId: activeModelId as Id<"geometry_models"> } : "skip"
  );

  useEffect(() => {
    if (!open) return;
    if (!selectedModelId && brandModels?.[0]?._id) {
      setSelectedModelId(String(brandModels[0]._id));
    }
    if (!selectedRecordId && modelRecords?.[0]?._id) {
      setSelectedRecordId(String(modelRecords[0]._id));
    }
  }, [brandModels, modelRecords, open, selectedModelId, selectedRecordId]);

  const selectedRecord = useMemo(() => {
    return modelRecords?.find((record) => String(record._id) === selectedRecordId) ?? null;
  }, [modelRecords, selectedRecordId]);

  async function handleLinkGeometry() {
    if (!selectedRecord) return;

    setIsLinking(true);
    try {
      await linkBikeToGeometry({ bikeId, recordId: selectedRecord._id });
      toast.success({
        title: "Geometry linked",
        description: `${selectedRecord.sizeLabel} v${selectedRecord.version} is now linked to this bike.`,
      });
      setOpen(false);
    } catch (error) {
      toast.error({
        title: "Could not link geometry",
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setIsLinking(false);
    }
  }

  return (
    <>
      <Button type="button" size={buttonSize} variant={buttonVariant} onClick={() => setOpen(true)}>
        {buttonLabel ?? (currentRecord ? "Re-link geometry" : "Link geometry")}
      </Button>

      <AccessibleDialog
        open={open}
        onClose={() => setOpen(false)}
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={isLinking} disabled={!selectedRecord} onClick={() => void handleLinkGeometry()}>
              Link record
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </>
  );
}
