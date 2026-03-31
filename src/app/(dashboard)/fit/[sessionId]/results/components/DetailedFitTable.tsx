"use client";

import type { ReportDetailedRow } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { getDeltaLabel, getStatusLabel } from "./format";
import { MetricTile, ResultsSection, StatusPill } from "./ResultsPrimitives";

type DetailedFitTableProps = {
  rows: ReportDetailedRow[];
  copy: ReportV2Copy;
};

export function DetailedFitTable({ rows, copy }: DetailedFitTableProps) {
  const showDeltaColumn = rows.some((row) => row.delta || row.currentLabel);

  return (
    <ResultsSection
      eyebrow={copy.sections.detailedFit}
      title={copy.sections.detailedFit}
      description={copy.adjustmentGuideline}
      tone="muted"
    >
      <div className="space-y-4">
        {rows.map((row) => {
          const parameter = copy.parameters[row.key];
          const deltaLabel = getDeltaLabel(row.delta, copy);

          return (
            <div
              key={row.key}
              className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold">{parameter.label}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {parameter.methodLabel}
                  </p>
                </div>
                <StatusPill tone={row.status === "ready" ? "success" : row.status === "pending_data" ? "warning" : "default"}>
                  {getStatusLabel(row.status, copy)}
                </StatusPill>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricTile label={copy.table.target} value={row.targetLabel} emphasis="primary" />
                <MetricTile label={copy.table.range} value={row.rangeLabel ?? "n/a"} />
                <MetricTile label={copy.table.confidence} value={`${row.confidence}%`} />
                {showDeltaColumn ? (
                  <MetricTile label={copy.table.delta} value={deltaLabel ?? row.currentLabel ?? "n/a"} />
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.table.feelDescription}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {parameter.feelDescription}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.table.watchOuts}
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-[color:var(--muted-foreground)]">
                    <li>{parameter.watchOutHigh}</li>
                    <li>{parameter.watchOutLow}</li>
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ResultsSection>
  );
}
