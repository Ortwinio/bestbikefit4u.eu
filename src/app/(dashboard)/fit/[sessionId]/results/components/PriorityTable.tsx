"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ReportPriorityRow } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { getStatusLabel } from "./format";

type PriorityTableProps = {
  rows: ReportPriorityRow[];
  copy: ReportV2Copy;
};

export function PriorityTable({ rows, copy }: PriorityTableProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>{copy.sections.prioritySummary}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
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
                    <span className="rounded-full bg-[color:var(--secondary)] px-3 py-1 text-xs font-medium">
                      {getStatusLabel(row.status, copy)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

