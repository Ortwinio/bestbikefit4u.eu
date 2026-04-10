import { Gauge } from "lucide-react";
import { PublicCalculatorResultSummary, PublicSurfaceCard } from "@/components/public";
import type { PublicResultEnvelope } from "@/lib/publicCalculatorLogic";
import type { PressureOutput } from "@/lib/pressure-engine";
import type { PressureResultLabels } from "./shared";

interface PressureResultCardProps {
  result: PressureOutput;
  labels: PressureResultLabels;
  isNl: boolean;
  summary: PublicResultEnvelope<unknown>;
  extraNotes: string[];
}

export function PressureResultCard({
  result,
  labels,
  isNl,
  summary,
  extraNotes,
}: PressureResultCardProps) {
  const allWarnings =
    result.warnings.length > 0
      ? [labels.disclaimer, ...result.warnings.map((warning) => labels.warningMessages[warning])]
      : [labels.disclaimer];

  return (
    <PublicSurfaceCard
      title={labels.explanation}
      leading={<Gauge className="h-5 w-5" />}
      className="rounded-[1.75rem]"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
            <p className="text-sm text-muted-foreground">{labels.front}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {result.frontBar} {labels.bar}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
            <p className="text-sm text-muted-foreground">{labels.rear}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {result.rearBar} {labels.bar}
            </p>
          </div>
        </div>

        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          {result.explanation}
        </p>
        <PublicCalculatorResultSummary
          result={summary}
          isNl={isNl}
          extraNotes={extraNotes}
          validationMessages={allWarnings}
        />

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
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-3"
              >
                <p className="text-sm text-[color:var(--muted-foreground)]">{label}</p>
                <p className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
                  {score ?? "-"}/100
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicSurfaceCard>
  );
}
