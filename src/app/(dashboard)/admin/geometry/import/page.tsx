"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { useAction } from "convex/react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Textarea,
} from "@/components/ui";
import { ErrorState } from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

const GEOMETRY_TEMPLATE_PATH = "/templates/geometry-import-template.csv";
const GEOMETRY_TEMPLATE_CSV = `brand_slug,brand_name,model_name,model_year,category,size_label,stack,reach,seat_tube_angle,head_tube_angle,wheelbase,chainstay,bb_drop,effective_top_tube,standover,fork_rake,head_tube_length,seat_tube_length,rider_height_min_cm,rider_height_max_cm,saddle_height_min_mm,saddle_height_max_mm,source,source_url
canyon,Canyon,Endurace CF SLX,2025,endurance,54,571,387,73.5,72.5,998,415,70,548,778,50,143,500,172,180,690,760,geometry_geeks,https://geometrygeeks.bike/
specialized,Specialized,Tarmac SL8,2024,race_road,56,565,395,73.5,73.5,990,410,72,565,801,44,155,520,175,183,705,775,geometry_geeks,https://geometrygeeks.bike/`;

function parsePreviewRows(csv: string) {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1, 6).map((line, index) => {
    const values = line.split(",");
    const row = Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex]?.trim() ?? ""])
    );
    return {
      id: `${index}-${row.size_label ?? "row"}`,
      brandSlug: row.brand_slug ?? "",
      modelName: row.model_name ?? "",
      modelYear: row.model_year ?? "",
      category: row.category ?? "",
      sizeLabel: row.size_label ?? "",
      stack: row.stack ?? "",
      reach: row.reach ?? "",
      source: row.source ?? "",
    };
  });
}

export default function GeometryImportPage() {
  const importGeometryFromCsv = useAction(api.admin.actions.importGeometryFromCsv);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csv, setCsv] = useState(GEOMETRY_TEMPLATE_CSV);
  const [fileName, setFileName] = useState("geometry-import-template.csv");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<{
    rowsProcessed: number;
    recordsCreated: number;
    errors: string[];
    previewRows: string[];
  } | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const parsedRows = parsePreviewRows(csv);

  async function handlePreview() {
    setIsPreviewing(true);
    try {
      const result = await importGeometryFromCsv({ csvContent: csv });
      setPreviewResult(result);
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const isCsvFile =
        file.name.toLowerCase().endsWith(".csv") ||
        file.type === "text/csv" ||
        file.type === "application/vnd.ms-excel";

      if (!isCsvFile) {
        throw new Error("Please upload a .csv file.");
      }

      const nextCsv = await file.text();
      if (!nextCsv.trim()) {
        throw new Error("The selected CSV file is empty.");
      }

      setCsv(nextCsv);
      setFileName(file.name);
      setPreviewResult(null);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not read the selected CSV file."
      );
    } finally {
      setIsUploadingFile(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-[color:var(--muted-foreground)]">Geometry import</div>
        <h1 className="text-3xl font-semibold tracking-tight">CSV import preview</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview live import input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
            <div className="flex-1 text-sm text-[color:var(--muted-foreground)]">
              Download the geometry CSV template first, then upload the completed file or paste matching rows here for preview.
            </div>
            <Button variant="outline" render={<Link href={GEOMETRY_TEMPLATE_PATH} download />}>
              Download geometry CSV template
            </Button>
          </div>
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
            <div className="text-sm font-medium">Upload geometry CSV</div>
            <div className="text-sm text-[color:var(--muted-foreground)]">
              Choose a `.csv` file that follows the geometry import template. The file content will be loaded into the preview editor below.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                isLoading={isUploadingFile}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload CSV file
              </Button>
              <span className="text-sm text-[color:var(--muted-foreground)]">
                {fileName || "No file selected"}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleFileChange(event)}
            />
            {uploadError ? (
              <p className="text-sm text-[color:var(--destructive)]">{uploadError}</p>
            ) : null}
          </div>
          <Input
            label="File name"
            value={fileName}
            onChange={(event) => {
              setUploadError(null);
              setFileName(event.target.value);
            }}
          />
          <Textarea
            label="CSV content"
            rows={10}
            value={csv}
            onChange={(event) => {
              setUploadError(null);
              setCsv(event.target.value);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button isLoading={isPreviewing} onClick={() => void handlePreview()}>
              Run import preview
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCsv(GEOMETRY_TEMPLATE_CSV);
                setFileName("geometry-import-template.csv");
                setPreviewResult(null);
              }}
            >
              Reset template sample
            </Button>
          </div>
        </CardContent>
      </Card>

      <ErrorState
        title="Geometry import persistence is still backend-limited"
        description="The action can parse CSV and return a preview, but there is no end-to-end persisted import pipeline yet. Use this page to validate the incoming payload before wiring a real importer."
      />

      {previewResult === null ? (
        <EmptyState
          title="No preview run yet"
          description="Run the preview to inspect parsed rows before any future persistence work."
        />
      ) : previewResult.errors.length > 0 ? (
        <ErrorState
          title="Import preview reported issues"
          description={previewResult.errors.join(" • ")}
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Preview results</CardTitle>
            <SharedStatusPill tone="success">
              {previewResult.recordsCreated} records ready
            </SharedStatusPill>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <div className="grid gap-4 px-4 pt-4 md:grid-cols-3">
              <Card variant="bordered">
                <CardContent className="pt-6">
                  <div className="text-sm text-[color:var(--muted-foreground)]">Rows processed</div>
                  <div className="mt-2 text-3xl font-semibold">{previewResult.rowsProcessed}</div>
                </CardContent>
              </Card>
              <Card variant="bordered">
                <CardContent className="pt-6">
                  <div className="text-sm text-[color:var(--muted-foreground)]">File name</div>
                  <div className="mt-2 text-sm">{fileName}</div>
                </CardContent>
              </Card>
              <Card variant="bordered">
                <CardContent className="pt-6">
                  <div className="text-sm text-[color:var(--muted-foreground)]">Preview rows</div>
                  <div className="mt-2 text-sm">{parsedRows.length}</div>
                </CardContent>
              </Card>
            </div>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Brand</th>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Stack / Reach</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row) => (
                    <tr key={row.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-4">{row.brandSlug}</td>
                      <td className="px-4 py-4">{row.modelName}</td>
                      <td className="px-4 py-4">{row.modelYear}</td>
                      <td className="px-4 py-4">{row.category}</td>
                      <td className="px-4 py-4">{row.sizeLabel}</td>
                      <td className="px-4 py-4">
                        {row.stack} / {row.reach}
                      </td>
                      <td className="px-4 py-4">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
