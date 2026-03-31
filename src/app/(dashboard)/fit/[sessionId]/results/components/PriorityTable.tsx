"use client";

import type { ReportPriorityRow } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { getStatusLabel } from "./format";
import { MetricTile, ResultsSection, StatusPill } from "./ResultsPrimitives";

type PriorityTableProps = {
  rows: ReportPriorityRow[];
  copy: ReportV2Copy;
};

export function PriorityTable({ rows, copy }: PriorityTableProps) {
  const readyCount = rows.filter((row) => row.status === "ready").length;
  const averageConfidence =
    rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row.confidence, 0) / rows.length) : 0;

  return (
    <ResultsSection
      eyebrow={copy.sections.prioritySummary}
      title={copy.sections.prioritySummary}
      description={copy.adjustmentGuideline}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile label={copy.table.status} value={`${readyCount}/${rows.length}`} detail="ready targets" />
          <MetricTile label={copy.table.confidence} value={`${averageConfidence}%`} emphasis="primary" />
          <MetricTile label={copy.table.parameter} value={rows.length} detail="fit priorities" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-[color:var(--muted-foreground)]">
                <th className="pb-3 pr-4 font-medium">{copy.table.parameter}</th>
                <th className="pb-3 pr-4 font-medium">{copy.table.target}</th>
                <th className="pb-3 pr-4 font-medium">{copy.table.whyItMatters}</th>
                <th className="pb-3 pr-4 font-medium">{copy.table.riderValidationCue}</th>
                <th className="pb-3 font-medium">{copy.table.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const parameter = copy.parameters[row.key];
                return (
                  <tr key={row.key} className="border-b border-[color:var(--border)]/70 align-top">
                    <td className="py-4 pr-4 font-medium">{parameter.label}</td>
                    <td className="py-4 pr-4">{row.targetLabel}</td>
                    <td className="py-4 pr-4 text-[color:var(--muted-foreground)]">
                      {parameter.whyItMatters}
                    </td>
                    <td className="py-4 pr-4 text-[color:var(--muted-foreground)]">
                      {parameter.riderValidationCue}
                    </td>
                    <td className="py-4">
                      <StatusPill tone={row.status === "ready" ? "success" : row.status === "pending_data" ? "warning" : "default"}>
                        {getStatusLabel(row.status, copy)}
                      </StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ResultsSection>
  );
}
