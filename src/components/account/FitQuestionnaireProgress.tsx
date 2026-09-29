"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toPercentBucket } from "@/lib/uiPercent";
import { formatFitQuestionnaireNumber, getFitQuestionnaireCopy } from "@/i18n/account/fitQuestionnaire";

interface FitQuestionnaireProgressProps {
  current: number;
  total: number;
  percentComplete: number;
}

export function FitQuestionnaireProgress({
  current,
  total,
  percentComplete,
}: FitQuestionnaireProgressProps) {
  const { locale } = useDashboardMessages();
  const copy = getFitQuestionnaireCopy(locale);
  const percentBucket = toPercentBucket(percentComplete);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{copy.question} <span className="font-mono">{formatFitQuestionnaireNumber(current, locale)}</span> {copy.of} <span className="font-mono">{formatFitQuestionnaireNumber(total, locale)}</span></span>
        <span className="font-mono text-primary">{new Intl.NumberFormat(locale, { style: "percent" }).format(percentComplete / 100)}</span>
      </div>
        <div role="progressbar" aria-label={copy.eyebrow} aria-valuenow={percentComplete} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className="csp-fill-width h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            data-fill-pct={percentBucket}
          />
        </div>
    </div>
  );
}
