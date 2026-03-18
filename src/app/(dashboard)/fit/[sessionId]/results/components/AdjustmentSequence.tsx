"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ReportAdjustmentStep } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";

type AdjustmentSequenceProps = {
  steps: ReportAdjustmentStep[];
  copy: ReportV2Copy;
};

export function AdjustmentSequence({ steps, copy }: AdjustmentSequenceProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>{copy.sections.adjustmentSequence}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {copy.adjustmentGuideline}
        </p>
        <ol className="space-y-4">
          {steps.map((step) => {
            const parameter = copy.parameters[step.key];
            return (
              <li key={step.key} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--secondary)] text-sm font-semibold">
                  {step.order}
                </div>
                <div className="flex-1 rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-3">
                  <p className="text-sm font-semibold">{parameter.label}</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{step.targetLabel}</p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                    {parameter.measurementReference}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {parameter.sequenceNote}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

