"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";

type ValidationPlanProps = {
  copy: ReportV2Copy;
};

export function ValidationPlan({ copy }: ValidationPlanProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>{copy.sections.validationPlan}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)]">
              <th className="pb-3 pr-4 font-medium">{copy.validationPlan.dayBlock}</th>
              <th className="pb-3 pr-4 font-medium">{copy.validationPlan.change}</th>
              <th className="pb-3 pr-4 font-medium">{copy.validationPlan.rideDuration}</th>
              <th className="pb-3 font-medium">{copy.validationPlan.whatToScore}</th>
            </tr>
          </thead>
          <tbody>
            {copy.validationPlan.rows.map((row) => (
              <tr key={row.dayBlock} className="border-b border-[color:var(--border)]/70 align-top">
                <td className="py-4 pr-4 font-medium">{row.dayBlock}</td>
                <td className="py-4 pr-4 text-[color:var(--muted-foreground)]">{row.change}</td>
                <td className="py-4 pr-4">{row.rideDuration}</td>
                <td className="py-4 text-[color:var(--muted-foreground)]">{row.whatToScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
