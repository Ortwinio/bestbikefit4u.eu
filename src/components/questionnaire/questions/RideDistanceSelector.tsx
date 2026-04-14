"use client";

import { toPercentBucket } from "@/lib/uiPercent";
import { cn } from "@/utils/cn";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type RideDistanceValue = "short" | "medium" | "long" | "ultra";

const DISTANCE_KEYS: RideDistanceValue[] = ["short", "medium", "long", "ultra"];

interface RideDistanceSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function RideDistanceSelector({
  value,
  onChange,
}: RideDistanceSelectorProps) {
  const { messages } = useDashboardMessages();
  const t = messages.questionnaire.rideDistance;

  const selectedIndex = value
    ? DISTANCE_KEYS.indexOf(value as RideDistanceValue)
    : -1;
  const fillPercent =
    selectedIndex >= 0
      ? (selectedIndex / (DISTANCE_KEYS.length - 1)) * 100
      : 0;
  const fillBucket = toPercentBucket(fillPercent);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">

      {/* Slider */}
      <div className="px-6 pt-6 pb-3">

        {/* Track + dots */}
        <div
          role="radiogroup"
          aria-label={t.radioGroupLabel}
          className="relative flex h-12 items-center justify-between"
        >
          {/* Track background */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-primary/20" />

          {/* Filled portion */}
          <div
            className="csp-fill-width pointer-events-none absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-300 ease-out"
            data-fill-pct={fillBucket}
          />

          {/* Snap-point buttons */}
          {DISTANCE_KEYS.map((key, i) => {
            const isActive = i === selectedIndex;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange(key)}
                className={cn(
                  "relative z-10 rounded-full bg-primary transition-all duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive
                    ? "size-8 border-4 border-background shadow-lg"
                    : "size-4 opacity-60 hover:opacity-100"
                )}
              />
            );
          })}
        </div>

        {/* Position labels */}
        <div className="mt-1 grid grid-cols-4 text-xs font-medium">
          {DISTANCE_KEYS.map((key, i) => (
            <span
              key={key}
              className={cn(
                "transition-colors duration-150",
                i === 0
                  ? "text-left"
                  : i === DISTANCE_KEYS.length - 1
                    ? "text-right"
                    : "text-center",
                key === value
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              )}
            >
              {t.options[key].label}
            </span>
          ))}
        </div>
      </div>

      {/* Explanation panel */}
      <div className="min-h-[88px] border-t border-border px-6 py-4">
        {value && DISTANCE_KEYS.includes(value as RideDistanceValue) ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              {t.options[value as RideDistanceValue].label}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                · {t.options[value as RideDistanceValue].subtitle}
              </span>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t.options[value as RideDistanceValue].tooltip}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">{t.selectPrompt}</p>
        )}
      </div>
    </div>
  );
}
