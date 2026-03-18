"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ReportDetailedRow } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { getDeltaLabel, getStatusLabel } from "./format";

type DetailedFitTableProps = {
  rows: ReportDetailedRow[];
  copy: ReportV2Copy;
};

export function DetailedFitTable({ rows, copy }: DetailedFitTableProps) {
  const showDeltaColumn = rows.some((row) => row.delta || row.currentLabel);

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>{copy.sections.detailedFit}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const parameter = copy.parameters[row.key];
          const deltaLabel = getDeltaLabel(row.delta, copy);

          return (
            <div
              key={row.key}
              className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold">{parameter.label}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {parameter.methodLabel}
                  </p>
                </div>
                <span className="rounded-full bg-[color:var(--secondary)] px-3 py-1 text-xs font-medium">
                  {getStatusLabel(row.status, copy)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.table.target}
                  </p>
                  <p className="mt-1 text-sm font-medium">{row.targetLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.table.range}
                  </p>
                  <p className="mt-1 text-sm font-medium">{row.rangeLabel ?? "n/a"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.table.confidence}
                  </p>
                  <p className="mt-1 text-sm font-medium">{row.confidence}%</p>
                </div>
                {showDeltaColumn ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      {copy.table.delta}
                    </p>
                    <p className="mt-1 text-sm font-medium">{deltaLabel ?? row.currentLabel ?? "n/a"}</p>
                  </div>
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
      </CardContent>
    </Card>
  );
}

