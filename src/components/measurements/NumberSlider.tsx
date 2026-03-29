"use client";

import { cn } from "@/utils/cn";

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
  // Unitless 0–1 fraction — valid multiplier in CSS calc(fraction * length)
  const pct = hasValue ? (value - min) / (max - min) : 0;

  return (
    <div className="space-y-2">
      {/* Label + live value badge */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hasValue && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {value} {unit}
          </span>
        )}
      </div>

      {/* Track area: 12 px inset each side keeps thumb inside bounds */}
      <div className="relative h-10">
        {/* Track background */}
        <div className="pointer-events-none absolute inset-x-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/15" />

        {/* Fill — calc(pct * (100% - 24px)) is valid: unitless × length */}
        {hasValue && (
          <div
            className="pointer-events-none absolute left-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
            style={{ width: `calc(${pct} * (100% - 24px))` }}
          />
        )}

        {/* Thumb — matches SliderQuestion active dot: size-6, border-4, shadow-md */}
        {hasValue && (
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 size-6",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full border-4 border-background bg-primary shadow-md"
            )}
            style={{ left: `calc(12px + ${pct} * (100% - 24px))` }}
          />
        )}

        {/* Native range input — transparent overlay, handles all interaction */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hasValue ? value : min}
          onMouseDown={onUserInteract}
          onTouchStart={onUserInteract}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={hasValue ? value : undefined}
          aria-valuetext={hasValue ? `${value} ${unit}` : undefined}
        />
      </div>

      {/* Min / max endpoint labels */}
      <div className="flex justify-between px-1 text-xs text-muted-foreground">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
