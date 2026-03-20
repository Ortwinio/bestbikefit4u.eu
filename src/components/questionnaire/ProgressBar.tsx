"use client";

import { formatMessage } from "@/i18n/dashboardMessages";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";
import { Progress } from "@/components/ui";

interface ProgressBarProps {
  current: number;
  total: number;
  estimatedMinutes?: number;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  estimatedMinutes,
  className,
}: ProgressBarProps) {
  const { messages } = useDashboardMessages();
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>{messages.questionnaire.progress.label}</span>
        <div className="flex items-center gap-3">
          {estimatedMinutes !== undefined ? (
            <span>
              {formatMessage(messages.questionnaire.progress.minutesLeft, {
                minutes: estimatedMinutes,
              })}
            </span>
          ) : null}
          <span>
            {formatMessage(messages.questionnaire.progress.percentComplete, {
              percent: percentage,
            })}
          </span>
        </div>
      </div>
      <Progress
        value={percentage}
        label={messages.questionnaire.progress.label}
        className="w-full"
      />
    </div>
  );
}
