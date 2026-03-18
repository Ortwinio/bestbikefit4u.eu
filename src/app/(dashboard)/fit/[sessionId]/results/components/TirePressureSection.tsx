"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ReportTirePressureSection as ReportTirePressurePayload } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { getSurfaceLabel } from "./format";

type TirePressureSectionProps = {
  tirePressure: ReportTirePressurePayload;
  warningMessages: Record<string, string>;
  copy: ReportV2Copy;
};

export function TirePressureSection({
  tirePressure,
  warningMessages,
  copy,
}: TirePressureSectionProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>{copy.sections.tirePressure}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tirePressure.status === "ready" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {copy.tirePressure.front}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {Math.round(tirePressure.frontPsi)} psi / {tirePressure.frontBar.toFixed(1)} bar
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {copy.tirePressure.rear}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {Math.round(tirePressure.rearPsi)} psi / {tirePressure.rearBar.toFixed(1)} bar
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {copy.tirePressure.confidence}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {tirePressure.confidence ? `${tirePressure.confidence}%` : "n/a"}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {copy.tirePressure.inputLabels.surface}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {getSurfaceLabel(tirePressure.surface, copy)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">{copy.tirePressure.inputsTitle}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tirePressure.inputs.map((input) => (
                  <span
                    key={input.label}
                    className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--muted-foreground)]"
                  >
                    {copy.tirePressure.inputLabels[
                      input.label as keyof typeof copy.tirePressure.inputLabels
                    ] ?? input.label}
                    : {input.value}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">{copy.tirePressure.warnings}</p>
              {tirePressure.warnings.length ? (
                <div className="mt-2 space-y-2">
                  {tirePressure.warnings.map((warning) => (
                    <div
                      key={warning}
                      className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                    >
                      {warningMessages[warning] ?? warning}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-green-700">{copy.tirePressure.noWarnings}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">{copy.tirePressure.pendingTitle}</p>
              <p className="mt-1">{copy.tirePressure.pendingDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tirePressure.required.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--muted-foreground)]"
                >
                  {copy.tirePressure.missingDataLabels[
                    item as keyof typeof copy.tirePressure.missingDataLabels
                  ] ?? item}
                </span>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold">{copy.tirePressure.quickStartTitle}</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {copy.tirePressure.quickStartNote}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--border)]">
                      <th className="pb-2 pr-4 font-medium">Weight</th>
                      <th className="pb-2 pr-4 font-medium">Tyre size</th>
                      <th className="pb-2 font-medium">PSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tirePressure.quickStartTable.map((row) => (
                      <tr key={`${row.weightLabel}-${row.tireSizeLabel}`} className="border-b border-[color:var(--border)]/70">
                        <td className="py-3 pr-4">{row.weightLabel}</td>
                        <td className="py-3 pr-4">{row.tireSizeLabel}</td>
                        <td className="py-3">{row.psiLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

