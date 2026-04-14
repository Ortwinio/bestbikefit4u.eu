"use client";

import { cn } from "@/utils/cn";
import { coreStabilityTests } from "@/lib/validations/profile";

const scoreColorMap: Record<number, string> = {
  1: "bg-[color:var(--color-danger)]",
  2: "bg-[color:var(--color-warning)]",
  3: "bg-[color:var(--color-warning)]",
  4: "bg-[color:var(--color-success)]",
  5: "bg-[color:var(--color-success)]",
};

export function getCoreStabilityMeta(score: number) {
  const normalized = Math.max(1, Math.min(5, score));
  const meta = coreStabilityTests[normalized - 1];

  return {
    ...meta,
    colorClass: scoreColorMap[normalized],
  };
}

export function CoreStabilityBar({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const meta = getCoreStabilityMeta(score);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-[color:var(--foreground)]">
          {meta.label}
        </p>
        <span className="rounded-full bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
          {meta.score}/5
        </span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-3 flex-1 rounded-full",
              segment <= meta.score ? meta.colorClass : "bg-[color:var(--muted)]"
            )}
          />
        ))}
      </div>
      <p className="text-sm text-[color:var(--muted-foreground)]">
        {meta.description}
      </p>
    </div>
  );
}
