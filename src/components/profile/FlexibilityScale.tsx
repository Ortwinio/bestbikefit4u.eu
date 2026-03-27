"use client";

import { type CSSProperties } from "react";
import { Progress } from "@/components/ui";
import { cn } from "@/utils/cn";
import { flexibilityTests } from "@/lib/validations/profile";

type FlexibilityScore = (typeof flexibilityTests)[number]["score"];

const scoreColorMap: Record<FlexibilityScore, string> = {
  very_limited: "var(--color-danger)",
  limited: "var(--color-warning)",
  average: "var(--color-warning)",
  good: "var(--color-success)",
  excellent: "var(--color-success)",
};

export function getFlexibilityMeta(score: FlexibilityScore) {
  const index = flexibilityTests.findIndex((test) => test.score === score);
  const test = flexibilityTests[index];

  return {
    ...test,
    index: index + 1,
    color: scoreColorMap[score],
  };
}

export function FlexibilityScale({
  score,
  className,
}: {
  score: FlexibilityScore;
  className?: string;
}) {
  const meta = getFlexibilityMeta(score);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-[color:var(--foreground)]">
          {meta.label}
        </p>
        <span className="rounded-full bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
          {meta.index}/5
        </span>
      </div>
      <Progress
        value={meta.index * 20}
        indicatorClassName="bg-[var(--progress-indicator-color)]"
        style={
          {
            "--progress-indicator-color": meta.color,
          } as CSSProperties
        }
      />
      <p className="text-sm text-[color:var(--muted-foreground)]">
        {meta.description}
      </p>
    </div>
  );
}
