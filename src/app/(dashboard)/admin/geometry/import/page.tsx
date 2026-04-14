"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { useAction } from "convex/react";
import { buildGeometryCsv } from "../../../../../../shared/geometryCsv";
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
const GEOMETRY_TEMPLATE_CSV = buildGeometryCsv([
  {
    brand_slug: "canyon",
    brand_name: "Canyon",
    model_name: "Endurace CF SLX",
    model_year: 2025,
    category: "endurance",
    size_label: "54",
    stack: 571,
    reach: 387,
    seat_tube_angle: 73.5,
    head_tube_angle: 72.5,
    wheelbase: 998,
    chainstay: 415,
    bb_drop: 70,
    effective_top_tube: 548,
    standover: 778,
    fork_rake: 50,
    head_tube_length: 143,
    seat_tube_length: 500,
    rider_height_min_cm: 172,
    rider_height_max_cm: 180,
    saddle_height_min_mm: 690,
    saddle_height_max_mm: 760,
    source: "geometry_geeks",
    source_url: "https://geometrygeeks.bike/",
  },
  {
    brand_slug: "specialized",
    brand_name: "Specialized",
    model_name: "Tarmac SL8",
    model_year: 2024,
    category: "race_road",
    size_label: "56",
    stack: 565,
    reach: 395,
    seat_tube_angle: 73.5,
    head_tube_angle: 73.5,
    wheelbase: 990,
    chainstay: 410,
    bb_drop: 72,
    effective_top_tube: 565,
    standover: 801,
    fork_rake: 44,
    head_tube_length: 155,
    seat_tube_length: 520,
    rider_height_min_cm: 175,
    rider_height_max_cm: 183,
    saddle_height_min_mm: 705,
    saddle_height_max_mm: 775,
    source: "geometry_geeks",
    source_url: "https://geometrygeeks.bike/",
  },
]);

function detectCsvDelimiter(line: string) {
  const commaCount = (line.match(/,/g) ?? []).length;
  const semicolonCount = (line.match(/;/g) ?? []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

function splitCsvLine(line: string, delimiter: string) {
  return line
    .replace(/^\uFEFF/, "")
    .split(delimiter)
    .map((value) => value.trim());
}

function parsePreviewRows(csv: string) {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const delimiter = detectCsvDelimiter(lines[0] ?? "");
  const headers = splitCsvLine(lines[0] ?? "", delimiter);

  return lines.slice(1, 6).map((line, index) => {
    const values = splitCsvLine(line, delimiter);
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
    recordsSkipped: number;
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
        <h1 className="text-3xl font-semibold tracking-tight">CSV geometry import</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import geometry CSV</CardTitle>
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
              Choose a `.csv` file that follows the geometry import template. Comma-separated and semicolon-separated CSV files are both supported.
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
              accept=".csv,text/csv,text/plain,application/vnd.ms-excel"
              className="block w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-background px-3 py-2 text-sm text-[color:var(--foreground)] file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[color:var(--secondary)] file:px-3 file:py-2 file:text-sm file:font-medium"
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
              Import CSV
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

      {previewResult === null ? (
        <EmptyState
          title="No import run yet"
          description="Import a CSV to create draft geometry records in the geometry library."
        />
      ) : previewResult.errors.length > 0 ? (
        <ErrorState
          title="Geometry import reported issues"
          description={previewResult.errors.join(" • ")}
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Import results</CardTitle>
            <SharedStatusPill tone="success">
              {previewResult.recordsCreated} draft records created
            </SharedStatusPill>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <div className="grid gap-4 px-4 pt-4 md:grid-cols-4">
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
              <Card variant="bordered">
                <CardContent className="pt-6">
                  <div className="text-sm text-[color:var(--muted-foreground)]">Skipped rows</div>
                  <div className="mt-2 text-3xl font-semibold">{previewResult.recordsSkipped}</div>
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
