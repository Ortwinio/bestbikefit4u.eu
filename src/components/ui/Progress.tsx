"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import {
  ProgressIndicator,
  ProgressTrack,
} from "@/components/prototyper-ui/ui/progress";
import { toPercentBucket } from "@/lib/uiPercent";
import { cn } from "@/utils/cn";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number | null;
  max?: number;
  label?: string;
  indicatorClassName?: string;
  trackClassName?: string;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      label,
      indicatorClassName,
      trackClassName,
      ...props
    },
    ref
  ) => {
    const percentage =
      value === null ? 100 : Math.max(0, Math.min(100, (value / max) * 100));
    const fillBucket = value === null ? "42" : toPercentBucket(percentage);

    return (
      <BaseProgress.Root
        ref={ref}
        value={value}
        max={max}
        aria-label={label}
        data-slot="progress"
        className={cn("w-full", className)}
        {...props}
      >
        <ProgressTrack
          color="default"
          size="lg"
          className={cn(
            "shadow-inset-track relative h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--muted)]",
            trackClassName
          )}
        >
          <ProgressIndicator
            color="default"
            className={cn(
              "csp-fill-width h-full rounded-full bg-[color:var(--primary)] transition-transform duration-300 ease-out motion-reduce:transition-none",
              value === null && "animate-pulse",
              indicatorClassName
            )}
            data-fill-pct={fillBucket}
          />
        </ProgressTrack>
      </BaseProgress.Root>
    );
  }
);

Progress.displayName = "Progress";
