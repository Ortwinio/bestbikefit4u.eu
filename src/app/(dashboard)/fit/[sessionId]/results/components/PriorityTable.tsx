"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getFitResultsCopy } from "@/i18n/account/fitResults";
import { FitResultsValue } from "@/components/account/FitResultsValue";
import type { ReportPriorityRow } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { getStatusLabel } from "./format";
import { MetricTile, ResultsSection, StatusPill } from "./ResultsPrimitives";

type PriorityTableProps = {
  rows: ReportPriorityRow[];
  copy: ReportV2Copy;
};

export function PriorityTable({ rows, copy }: PriorityTableProps) {
  const { locale } = useDashboardMessages();
  const text = getFitResultsCopy(locale);
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
          <MetricTile label={copy.table.status} value={`${readyCount}/${rows.length}`} detail={text.readyTargets} />
          <MetricTile label={copy.table.confidence} value={`${averageConfidence}%`} emphasis="primary" />
          <MetricTile label={copy.table.parameter} value={rows.length} detail={text.priorities} />
        </div>

        <div className="overflow-x-auto">
          <table className="block w-full text-left text-sm lg:table">
            <thead className="hidden lg:table-header-group">
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">{copy.table.parameter}</th>
                <th className="pb-3 pr-4 font-medium">{copy.table.target}</th>
                <th className="pb-3 pr-4 font-medium">{copy.table.whyItMatters}</th>
                <th className="pb-3 pr-4 font-medium">{copy.table.riderValidationCue}</th>
                <th className="pb-3 font-medium">{copy.table.status}</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group">
              {rows.map((row) => {
                const parameter = copy.parameters[row.key];
                return (
                  <tr key={row.key} className="grid gap-2 border-b border-border py-4 lg:table-row">
                    <td className="lg:py-4 lg:pr-4 font-medium">{parameter.label}</td>
                    <td className="lg:py-4 lg:pr-4"><span className="block font-semibold lg:hidden">{copy.table.target}</span><FitResultsValue value={row.targetLabel} locale={locale} /></td>
                    <td className="lg:py-4 lg:pr-4 text-muted-foreground">
                      <span className="block font-semibold lg:hidden">{copy.table.whyItMatters}</span>{parameter.whyItMatters}
                    </td>
                    <td className="lg:py-4 lg:pr-4 text-muted-foreground">
                      <span className="block font-semibold lg:hidden">{copy.table.riderValidationCue}</span>{parameter.riderValidationCue}
                    </td>
                    <td className="lg:py-4">
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
