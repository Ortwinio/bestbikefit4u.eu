"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
  Select,
  useToast,
} from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

const GEOMETRY_TEMPLATE_PATH = "/templates/geometry-import-template.csv";

type BulkStatus = "draft" | "active" | "rejected";
type FilterStatus = BulkStatus | "superseded" | "all";

function formatStatusTone(status: FilterStatus | "superseded") {
  if (status === "active") {
    return "success" as const;
  }
  if (status === "rejected") {
    return "danger" as const;
  }
  if (status === "superseded") {
    return "neutral" as const;
  }
  return "warning" as const;
}

export default function GeometryHubPage() {
  const toast = useToast();
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [bulkStatus, setBulkStatus] = useState<BulkStatus>("active");
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [isSubmittingBulkStatus, setIsSubmittingBulkStatus] = useState(false);

  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const summary = useQuery(api.admin.queries.getGeometryHubSummary, {});
  const models = useQuery(
    api.admin.queries.listGeometryModels,
    brandFilter ? { brandId: brandFilter as never } : "skip"
  );
  const filteredRecords = useQuery(api.admin.queries.listGeometryRecordsForAdminReview, {
    brandId: brandFilter ? (brandFilter as never) : undefined,
    modelId: modelFilter ? (modelFilter as never) : undefined,
    year: yearFilter ? Number(yearFilter) : undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const bulkUpdateGeometryRecordStatus = useMutation(
    api.admin.mutations.bulkUpdateGeometryRecordStatus
  );

  const yearOptions = useMemo(() => {
    if (!models) {
      return [];
    }

    return [...new Set(models.flatMap((model) => {
      const years: number[] = [];
      if (model.yearStart !== undefined && model.yearEnd !== undefined) {
        for (let year = model.yearStart; year <= model.yearEnd; year += 1) {
          years.push(year);
        }
      } else if (model.yearStart !== undefined) {
        years.push(model.yearStart);
      } else if (model.yearEnd !== undefined) {
        years.push(model.yearEnd);
      }
      return years;
    }))].sort((left, right) => right - left);
  }, [models]);

  useEffect(() => {
    setModelFilter("");
    setYearFilter("");
  }, [brandFilter]);

  useEffect(() => {
    if (!filteredRecords) {
      return;
    }

    const visibleIds = new Set(filteredRecords.map((record) => String(record._id)));
    setSelectedRecordIds((current) => current.filter((recordId) => visibleIds.has(recordId)));
  }, [filteredRecords]);

  if (brands === undefined || summary === undefined || filteredRecords === undefined) {
    return <LoadingState label="Loading geometry hub..." />;
  }

  const modelOptions = (models ?? []).map((model) => ({
    value: String(model._id),
    label:
      model.yearStart && model.yearEnd && model.yearStart !== model.yearEnd
        ? `${model.name} (${model.yearStart}-${model.yearEnd})`
        : model.yearStart
          ? `${model.name} (${model.yearStart})`
          : model.name,
  }));
  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "rejected", label: "Rejected" },
    { value: "superseded", label: "Superseded" },
  ];
  const bulkStatusOptions = [
    { value: "active", label: "Set selected to active" },
    { value: "draft", label: "Set selected to draft" },
    { value: "rejected", label: "Set selected to rejected" },
  ];

  const allVisibleSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((record) => selectedRecordIds.includes(String(record._id)));

  async function handleBulkStatusUpdate() {
    if (selectedRecordIds.length === 0) {
      return;
    }

    setIsSubmittingBulkStatus(true);
    try {
      const result = await bulkUpdateGeometryRecordStatus({
        recordIds: selectedRecordIds as never,
        status: bulkStatus,
      });
      toast.success({
        description: `Updated ${result.updatedCount} geometry records to ${bulkStatus}.`,
      });
      setSelectedRecordIds([]);
    } catch (error) {
      toast.error({
        description:
          error instanceof Error ? error.message : "Failed to update the selected geometry records.",
      });
    } finally {
      setIsSubmittingBulkStatus(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-[color:var(--muted-foreground)]">Geometry library</div>
        <h1 className="text-3xl font-semibold tracking-tight">Geometry hub</h1>
        <p className="mt-2 max-w-3xl text-[color:var(--muted-foreground)]">
          Review the live geometry library by brand, model, and year. Select matching records in
          bulk and update their review status in one action.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{summary.brandCount}</div>
            <Button render={<Link href="/admin/geometry/brands" />}>Open brand library</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{summary.modelCount}</div>
            <div className="text-sm text-[color:var(--muted-foreground)]">
              Use the review table below to narrow records to a specific model year.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{summary.recordCount}</div>
            <div className="flex flex-wrap gap-2">
              <SharedStatusPill tone="warning">{summary.draftRecordCount} draft</SharedStatusPill>
              <SharedStatusPill tone="success">{summary.activeRecordCount} active</SharedStatusPill>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Imports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              Upload a geometry CSV and create draft records for review.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/admin/geometry/import" />}>Open CSV import</Button>
              <Button variant="outline" render={<Link href={GEOMETRY_TEMPLATE_PATH} download />}>
                Download CSV template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Record review and bulk status</CardTitle>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                Filter by brand, model, and year. Select the matching records and update their
                review status together.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SharedStatusPill tone="info">{filteredRecords.length} visible</SharedStatusPill>
              <SharedStatusPill tone="neutral">{selectedRecordIds.length} selected</SharedStatusPill>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Select
              label="Brand"
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
              options={[
                { value: "", label: "All brands" },
                ...brands
                  .slice()
                  .sort((left, right) => left.name.localeCompare(right.name))
                  .map((brand) => ({ value: String(brand._id), label: brand.name })),
              ]}
            />
            <Select
              label="Model"
              value={modelFilter}
              onChange={(event) => setModelFilter(event.target.value)}
              options={[{ value: "", label: brandFilter ? "All models" : "Select a brand first" }, ...modelOptions]}
              disabled={!brandFilter || modelOptions.length === 0}
            />
            <Select
              label="Year"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              options={[
                { value: "", label: brandFilter ? "All years" : "Select a brand first" },
                ...yearOptions.map((year) => ({ value: String(year), label: String(year) })),
              ]}
              disabled={!brandFilter || yearOptions.length === 0}
            />
            <Select
              label="Current status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
              options={statusOptions}
            />
          </div>

          <div className="flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4">
            <div className="min-w-64 flex-1">
              <Select
                label="Bulk action"
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value as BulkStatus)}
                options={bulkStatusOptions}
              />
            </div>
            <Button
              onClick={() => void handleBulkStatusUpdate()}
              disabled={selectedRecordIds.length === 0}
              isLoading={isSubmittingBulkStatus}
            >
              Update selected records
            </Button>
            <Button
              variant="outline"
              disabled={filteredRecords.length === 0}
              onClick={() => {
                setSelectedRecordIds(
                  allVisibleSelected ? [] : filteredRecords.map((record) => String(record._id))
                );
              }}
            >
              {allVisibleSelected ? "Clear visible selection" : "Select all visible"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No geometry records match these filters"
                description="Change the brand, model, year, or status filter to widen the review list."
              />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="w-12 px-4 py-3 font-medium">
                    <input
                      type="checkbox"
                      aria-label="Select all visible geometry records"
                      checked={allVisibleSelected}
                      onChange={() => {
                        setSelectedRecordIds(
                          allVisibleSelected ? [] : filteredRecords.map((record) => String(record._id))
                        );
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Brand / model</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Stack / reach</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const isSelected = selectedRecordIds.includes(String(record._id));
                  return (
                    <tr key={String(record._id)} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-4 align-top">
                        <input
                          type="checkbox"
                          aria-label={`Select ${record.brandName} ${record.modelName} ${record.sizeLabel}`}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedRecordIds((current) =>
                              isSelected
                                ? current.filter((recordId) => recordId !== String(record._id))
                                : [...current, String(record._id)]
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{record.brandName}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {record.modelName} · v{record.version}
                        </div>
                      </td>
                      <td className="px-4 py-4">{record.modelYearLabel}</td>
                      <td className="px-4 py-4">{record.sizeLabel}</td>
                      <td className="px-4 py-4">
                        {record.stack ?? "?"} / {record.reach ?? "?"}
                      </td>
                      <td className="px-4 py-4">
                        <SharedStatusPill tone="info">{record.source}</SharedStatusPill>
                      </td>
                      <td className="px-4 py-4">
                        <SharedStatusPill tone={formatStatusTone(record.status)}>
                          {record.status}
                        </SharedStatusPill>
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/admin/geometry/${String(record._id)}`} />}
                        >
                          Open record
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {summary.recentRecords.length > 0 ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent geometry records</CardTitle>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                The newest imported or created records appear first.
              </p>
            </div>
            <Button variant="outline" render={<Link href="/admin/geometry/brands" />}>
              Browse full library
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Brand / model</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentRecords.map((record) => (
                  <tr key={String(record._id)} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4">
                      <div className="font-medium">{record.brandName}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">
                        {record.modelName}
                      </div>
                    </td>
                    <td className="px-4 py-4">{record.sizeLabel}</td>
                    <td className="px-4 py-4">
                      <SharedStatusPill tone="info">{record.source}</SharedStatusPill>
                    </td>
                    <td className="px-4 py-4">
                      <SharedStatusPill tone={formatStatusTone(record.status)}>
                        {record.status}
                      </SharedStatusPill>
                    </td>
                    <td className="px-4 py-4">v{record.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No geometry records yet"
          description="Import a CSV or create the first brand and model to start filling the geometry library."
          action={<Button render={<Link href="/admin/geometry/import" />}>Import geometry CSV</Button>}
        />
      )}
    </div>
  );
}
