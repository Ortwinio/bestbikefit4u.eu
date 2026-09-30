"use client";

import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { ResultsSection } from "./ResultsPrimitives";

type ValidationPlanProps = {
  copy: ReportV2Copy;
};

export function ValidationPlan({ copy }: ValidationPlanProps) {
  return (
    <ResultsSection
      eyebrow={copy.sections.validationPlan}
      title={copy.sections.validationPlan}
      description={copy.adjustmentGuideline}
      tone="muted"
    >
      <div className="overflow-x-auto">
        <table className="block w-full text-left text-sm lg:table">
          <thead className="hidden lg:table-header-group">
            <tr className="border-b border-border">
              <th className="pb-3 pr-4 font-medium">{copy.validationPlan.dayBlock}</th>
              <th className="pb-3 pr-4 font-medium">{copy.validationPlan.change}</th>
              <th className="pb-3 pr-4 font-medium">{copy.validationPlan.rideDuration}</th>
              <th className="pb-3 font-medium">{copy.validationPlan.whatToScore}</th>
            </tr>
          </thead>
          <tbody className="block lg:table-row-group">
            {copy.validationPlan.rows.map((row) => (
              <tr key={row.dayBlock} className="grid gap-2 border-b border-border py-4 lg:table-row">
                <td className="lg:py-4 lg:pr-4 font-medium">{row.dayBlock}</td>
                <td className="lg:py-4 lg:pr-4 text-muted-foreground"><span className="block font-semibold lg:hidden">{copy.validationPlan.change}</span>{row.change}</td>
                <td className="lg:py-4 lg:pr-4"><span className="block font-semibold lg:hidden">{copy.validationPlan.rideDuration}</span>{row.rideDuration}</td>
                <td className="lg:py-4 text-muted-foreground"><span className="block font-semibold lg:hidden">{copy.validationPlan.whatToScore}</span>{row.whatToScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResultsSection>
  );
}
