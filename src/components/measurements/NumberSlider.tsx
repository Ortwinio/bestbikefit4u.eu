"use client";

import { toPercentBucket } from "@/lib/uiPercent";
import { cn } from "@/utils/cn";
import { Slider } from "@/components/ui";

/**
 * Compact read-only slider — same visual language as NumberSlider but non-interactive.
 * Used in profile view mode to display a measurement on its range.
 */
export function ReadOnlyNumberSlider({
  label,
  value,
  min,
  max,
  unit,
}: {
  label: string;
  value: number | undefined | null;
  min: number;
  max: number;
  unit?: string;
}) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  const pct = hasValue ? (value - min) / (max - min) : 0;
  const rangeBucket = toPercentBucket(pct * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {hasValue ? (
          <span className="font-mono text-2xl font-medium text-foreground">
            {value} {unit}
          </span>
        ) : (
          <span className="font-mono text-2xl text-muted-foreground">—</span>
        )}
      </div>
      <div className="relative h-6">
        {/* Track */}
        <div className="pointer-events-none absolute inset-x-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary/15" />
        {/* Fill */}
        {hasValue && (
          <div
            className="csp-range-fill pointer-events-none absolute left-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary/60"
            data-range-pct={rangeBucket}
          />
        )}
        {/* Thumb */}
        {hasValue && (
          <div
            className={cn(
              "csp-range-left pointer-events-none absolute top-1/2 size-4",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full border-2 border-background bg-primary shadow-sm ring-2 ring-primary/30"
            )}
            data-range-pct={rangeBucket}
          />
        )}
      </div>
      <div className="flex justify-between px-1 font-mono text-xs text-muted-foreground">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

/**
 * Continuous numeric range slider styled identically to SliderQuestion
 * in RidingStyleCard — same track, fill formula, and active thumb.
 */
export function NumberSlider({
  label,
  value,
  onChange,
  onUserInteract,
  min,
  max,
  step = 1,
  unit,
  error,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  /** Called on first pointer/touch contact — use to mark the field as manually edited */
  onUserInteract?: () => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
}) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  return (
    <Slider
      label={label}
      min={min}
      max={max}
      step={step}
      value={hasValue ? value : min}
      valueLabel={hasValue ? String(value) : "—"}
      unit={unit}
      error={error}
      onPointerDown={onUserInteract}
      onChange={(nextValue) => {
        onUserInteract?.();
        onChange(nextValue);
      }}
      ticks={[{ value: min, label: `${min} ${unit ?? ""}` }, { value: max, label: `${max} ${unit ?? ""}` }]}
    />
  );
}
