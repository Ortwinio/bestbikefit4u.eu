import { AlertTriangle, Gauge } from "lucide-react";
import { Card, CardContent, InfoBox, MeasurementTile, SectionHeader } from "@/components/ui";
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
      <SectionHeader
        icon={<Gauge className="h-4 w-4 text-[color:var(--primary)]" />}
        title={labels.explanation}
      />
      <CardContent className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <MeasurementTile
            label={labels.front}
            value={`${result.frontBar} ${labels.bar}`}
          />
          <MeasurementTile
            label={labels.rear}
            value={`${result.rearBar} ${labels.bar}`}
          />
        </div>

        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          {result.explanation}
        </p>

        <InfoBox
          variant="warning"
          icon={<AlertTriangle className="h-4 w-4 text-[color:var(--warning)]" />}
        >
          <p className="font-semibold text-[color:var(--warning-foreground)]">
            {labels.warningsTitle}
          </p>
          <ul className="mt-2 space-y-2">
            {allWarnings.map((warning, index) => (
              <li key={`${warning}-${index}`} className="text-[color:var(--warning-foreground)]">{warning}</li>
            ))}
          </ul>
        </InfoBox>

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
