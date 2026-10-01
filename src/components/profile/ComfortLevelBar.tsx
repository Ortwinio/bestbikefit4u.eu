"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { profileText } from "@/i18n/account/profileLanguage";

import { cn } from "@/utils/cn";
import { comfortLevels } from "@/lib/validations/profile";

const scoreColorMap: Record<number, string> = {
  1: "bg-[color:var(--color-danger)]",
  2: "bg-[color:var(--color-warning)]",
  3: "bg-[color:var(--color-warning)]",
  4: "bg-[color:var(--color-success)]",
  5: "bg-[color:var(--color-success)]",
};

export function getComfortMeta(score: number) {
  const normalized = Math.max(1, Math.min(5, score));
  const meta = comfortLevels[normalized - 1];

  return {
    ...meta,
    colorClass: scoreColorMap[normalized],
  };
}

export function ComfortLevelBar({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const { locale } = useDashboardMessages();
  const meta = getComfortMeta(score);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
          {profileText(locale, meta.label)}
        </p>
        <span className="rounded-full bg-[color:var(--color-secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--color-secondary-foreground)]">
          {meta.score}/5
        </span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-3 flex-1 rounded-full",
              segment <= meta.score ? meta.colorClass : "bg-[color:var(--color-muted)]"
            )}
          />
        ))}
      </div>
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        {profileText(locale, meta.description)}
      </p>
    </div>
  );
}
