"use client";

import type { ReportTirePressureSection as ReportTirePressurePayload } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import { getSurfaceLabel } from "./format";
import { MetricTile, ResultsSection, StatusPill } from "./ResultsPrimitives";

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
    <ResultsSection
      eyebrow={copy.sections.tirePressure}
      title={copy.sections.tirePressure}
      description={copy.tirePressure.quickStartNote}
      tone="highlight"
    >
      <div className="space-y-4">
        {tirePressure.status === "ready" ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricTile
                  label={copy.tirePressure.front}
                  value={`${Math.round(tirePressure.frontPsi)} psi`}
                  detail={`${tirePressure.frontBar.toFixed(1)} bar`}
                  emphasis="primary"
                />
                <MetricTile
                  label={copy.tirePressure.rear}
                  value={`${Math.round(tirePressure.rearPsi)} psi`}
                  detail={`${tirePressure.rearBar.toFixed(1)} bar`}
                  emphasis="primary"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricTile
                  label={copy.tirePressure.confidence}
                  value={tirePressure.confidence ? `${tirePressure.confidence}%` : "n/a"}
                />
                <MetricTile
                  label={copy.tirePressure.inputLabels.surface}
                  value={getSurfaceLabel(tirePressure.surface, copy)}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">{copy.tirePressure.inputsTitle}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tirePressure.inputs.map((input) => (
                  <span
                    key={input.label}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs text-[color:var(--muted-foreground)]"
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
                      className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]"
                    >
                      {warningMessages[warning] ?? warning}
                    </div>
                  ))}
                </div>
              ) : (
                <StatusPill tone="success">{copy.tirePressure.noWarnings}</StatusPill>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
              <p className="font-semibold">{copy.tirePressure.pendingTitle}</p>
              <p className="mt-1">{copy.tirePressure.pendingDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tirePressure.required.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs text-[color:var(--muted-foreground)]"
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
                      <th className="pb-2 pr-4 font-medium">
                        {copy.tirePressure.quickStartColumns.weight}
                      </th>
                      <th className="pb-2 pr-4 font-medium">
                        {copy.tirePressure.quickStartColumns.tireSize}
                      </th>
                      <th className="pb-2 font-medium">
                        {copy.tirePressure.quickStartColumns.psi}
                      </th>
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
      </div>
    </ResultsSection>
  );
}
