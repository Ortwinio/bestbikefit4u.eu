"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { StatusPill } from "@/components/admin/shared/StatusPill";

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
  const [csv, setCsv] = useState("brand_slug,model_name,category,size_label,stack,reach\ncanyon,Endurace CF SLX,endurance,54,571,387");
  const [fileName, setFileName] = useState("manual-paste.csv");
  const [previewReady, setPreviewReady] = useState(true);

  const previewRows = useMemo(() => parsePreviewRows(csv), [csv]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-[color:var(--muted-foreground)]">Geometry import</div>
        <h1 className="text-3xl font-semibold tracking-tight">CSV import preview</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload or paste CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="File name" value={fileName} onChange={(event) => setFileName(event.target.value)} />
          <input
            type="file"
            accept=".csv"
            className="block w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setFileName(file.name);
              }
            }}
          />
          <Textarea
            label="CSV content"
            rows={10}
            value={csv}
            onChange={(event) => {
              setCsv(event.target.value);
              setPreviewReady(false);
            }}
          />
          <div className="flex gap-2">
            <Button onClick={() => setPreviewReady(true)}>Preview first 5 rows</Button>
            <Button variant="outline">Import records</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Preview</CardTitle>
          <StatusPill tone={previewReady ? "success" : "warning"}>{previewReady ? "ready" : "needs refresh"}</StatusPill>
        </CardHeader>
        <CardContent className="p-0">
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
              {previewRows.map((row) => (
                <tr key={row.id} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-4">{row.brandSlug}</td>
                  <td className="px-4 py-4">{row.modelName}</td>
                  <td className="px-4 py-4">{row.category}</td>
                  <td className="px-4 py-4">{row.sizeLabel}</td>
                  <td className="px-4 py-4">{row.stack} / {row.reach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

