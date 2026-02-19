"use client";

import { cn } from "@/utils/cn";

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
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Progress</span>
        <div className="flex items-center gap-3">
          {estimatedMinutes !== undefined ? (
            <span>~{estimatedMinutes} min left</span>
          ) : null}
          <span>{percentage}% complete</span>
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
