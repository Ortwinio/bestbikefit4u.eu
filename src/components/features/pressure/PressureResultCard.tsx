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
    result.warnings.length > 0 ? [labels.disclaimer, ...result.warnings.map((warning) => labels.warningMessages[warning])] : [labels.disclaimer];

  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-700">{labels.front}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {result.frontBar} {labels.bar}
          </p>
          <p className="mt-1 text-sm text-gray-600">{result.frontPsi} {labels.psi}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-700">{labels.rear}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {result.rearBar} {labels.bar}
          </p>
          <p className="mt-1 text-sm text-gray-600">{result.rearPsi} {labels.psi}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-900">{labels.explanation}</p>
        <p className="mt-1 text-sm text-gray-600">{result.explanation}</p>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">{labels.warningsTitle}</p>
        <ul className="mt-2 space-y-2 text-sm text-amber-800">
          {allWarnings.map((warning, index) => (
            <li key={`${warning}-${index}`}>{warning}</li>
          ))}
        </ul>
      </div>

      {(result.comfortScore !== undefined ||
        result.gripScore !== undefined ||
        result.efficiencyScore !== undefined) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            [labels.comfortScore, result.comfortScore],
            [labels.gripScore, result.gripScore],
            [labels.efficiencyScore, result.efficiencyScore],
          ].map(([label, score]) => (
            <div key={label} className="rounded-xl border border-gray-200 p-3">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{score ?? "-"}/100</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
