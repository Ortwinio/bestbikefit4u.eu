"use client";

import type { ReportAdjustmentStep } from "@/lib/reports/reportV2Types";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { FitResultsValue } from "@/components/account/FitResultsValue";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { ResultsSection } from "./ResultsPrimitives";

type AdjustmentSequenceProps = {
  steps: ReportAdjustmentStep[];
  copy: ReportV2Copy;
};

export function AdjustmentSequence({ steps, copy }: AdjustmentSequenceProps) {
  const { locale } = useDashboardMessages();
  return (
    <ResultsSection
      eyebrow={copy.sections.adjustmentSequence}
      title={copy.sections.adjustmentSequence}
      description={copy.adjustmentGuideline}
    >
      <div className="space-y-4">
        <ol className="space-y-4">
          {steps.map((step) => {
            const parameter = copy.parameters[step.key];
            return (
              <li key={step.key} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                  <FitResultsValue value={step.order} locale={locale} />
                </div>
                <div className="flex-1 rounded-[var(--radius-lg)] border border-border bg-secondary/30 px-4 py-4">
                  <p className="text-sm font-semibold">{parameter.label}</p>
                  <p className="mt-1 text-sm text-foreground"><FitResultsValue value={step.targetLabel} locale={locale} /></p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {parameter.measurementReference}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {parameter.sequenceNote}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </ResultsSection>
  );
}
