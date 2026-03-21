import { Card, CardContent } from "@/components/ui";
import type { PressureOutput } from "@/lib/pressure-engine";
import type { PressureResultLabels } from "./shared";

interface PressureResultCardProps {
  result: PressureOutput;
  labels: PressureResultLabels;
}

export function PressureResultCard({
  result,
  labels,
}: PressureResultCardProps) {
  const allWarnings =
    result.warnings.length > 0
      ? [labels.disclaimer, ...result.warnings.map((warning) => labels.warningMessages[warning])]
      : [labels.disclaimer];

  return (
    <Card variant="bordered" className="overflow-hidden">
      <CardContent className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
            <p className="text-sm font-medium text-[color:var(--foreground)]">{labels.front}</p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--foreground)]">
              {result.frontBar} {labels.bar}
            </p>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              {result.frontPsi} {labels.psi}
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
            <p className="text-sm font-medium text-[color:var(--foreground)]">{labels.rear}</p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--foreground)]">
              {result.rearBar} {labels.bar}
            </p>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              {result.rearPsi} {labels.psi}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">{labels.explanation}</p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
            {result.explanation}
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)] p-4">
          <p className="text-sm font-semibold text-[color:var(--warning-foreground)]">
            {labels.warningsTitle}
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[color:var(--warning-foreground)]">
            {allWarnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>

        {(result.comfortScore !== undefined ||
          result.gripScore !== undefined ||
          result.efficiencyScore !== undefined) && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [labels.comfortScore, result.comfortScore],
              [labels.gripScore, result.gripScore],
              [labels.efficiencyScore, result.efficiencyScore],
            ].map(([label, score]) => (
              <div
                key={label}
                className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-3"
              >
                <p className="text-sm text-[color:var(--muted-foreground)]">{label}</p>
                <p className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
                  {score ?? "-"}/100
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
