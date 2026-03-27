"use client";

import { cn } from "@/utils/cn";
import { comfortLevels } from "@/lib/validations/profile";

const scoreColorMap: Record<number, string> = {
  1: "var(--color-danger)",
  2: "var(--color-warning)",
  3: "var(--color-warning)",
  4: "var(--color-success)",
  5: "var(--color-success)",
};

export function getComfortMeta(score: number) {
  const normalized = Math.max(1, Math.min(5, score));
  const meta = comfortLevels[normalized - 1];

  return {
    ...meta,
    color: scoreColorMap[normalized],
  };
}

export function ComfortLevelBar({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const meta = getComfortMeta(score);

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
            className="h-3 flex-1 rounded-full"
            style={{
              backgroundColor:
                segment <= meta.score ? meta.color : "var(--color-muted)",
            }}
          />
        ))}
      </div>
      <p className="text-sm text-[color:var(--muted-foreground)]">
        {meta.description}
      </p>
    </div>
  );
}
