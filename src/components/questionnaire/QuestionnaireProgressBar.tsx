"use client";

import { Clock } from "lucide-react";
import { formatMessage } from "@/i18n/dashboardMessages";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface QuestionnaireProgressBarProps {
  estimatedMinutes: number;
  percentComplete: number;
}

export function QuestionnaireProgressBar({
  estimatedMinutes,
  percentComplete,
}: QuestionnaireProgressBarProps) {
  const { messages } = useDashboardMessages();
  const t = messages.questionnaire.progress;

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-muted/50 px-4 py-3">
      <Clock className="h-4 w-4 shrink-0 text-primary" />
      <span className="text-sm text-muted-foreground">
        {formatMessage(t.minutesLeft, { minutes: estimatedMinutes })}
      </span>
      <span className="text-border">·</span>
      <div className="flex flex-1 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">
          {formatMessage(t.percentComplete, { percent: percentComplete })}
        </span>
      </div>
    </div>
  );
}
