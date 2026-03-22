"use client";

import { useState } from "react";
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

function parsePreviewRows(csv: string) {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  return lines.slice(1, 6).map((line, index) => {
    const [brandSlug, modelName, category, sizeLabel, stack, reach] = line.split(",");
    return {
      id: `${index}-${sizeLabel ?? "row"}`,
      brandSlug: brandSlug?.trim() ?? "",
      modelName: modelName?.trim() ?? "",
      category: category?.trim() ?? "",
      sizeLabel: sizeLabel?.trim() ?? "",
      stack: stack?.trim() ?? "",
      reach: reach?.trim() ?? "",
    };
  });
}

export default function GeometryImportPage() {
  const importGeometryFromCsv = useAction(api.admin.actions.importGeometryFromCsv);
  const [csv, setCsv] = useState(
    "brand_slug,model_name,category,size_label,stack,reach\ncanyon,Endurace CF SLX,endurance,54,571,387"
  );
  const [fileName, setFileName] = useState("manual-paste.csv");
  const [previewResult, setPreviewResult] = useState<{
    rowsProcessed: number;
    recordsCreated: number;
    errors: string[];
    previewRows: string[];
  } | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

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
          <Input
            label="File name"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
          />
          <Textarea
            label="CSV content"
            rows={10}
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button isLoading={isPreviewing} onClick={() => void handlePreview()}>
              Run import preview
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCsv(
                  "brand_slug,model_name,category,size_label,stack,reach\ncanyon,Endurace CF SLX,endurance,54,571,387"
                );
                setFileName("manual-paste.csv");
                setPreviewResult(null);
              }}
            >
              Reset sample
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
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Stack / Reach</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row) => (
                    <tr key={row.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-4">{row.brandSlug}</td>
                      <td className="px-4 py-4">{row.modelName}</td>
                      <td className="px-4 py-4">{row.category}</td>
                      <td className="px-4 py-4">{row.sizeLabel}</td>
                      <td className="px-4 py-4">
                        {row.stack} / {row.reach}
                      </td>
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
