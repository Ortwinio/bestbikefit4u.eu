import { useId } from "react";
import { cn } from "@/utils/cn";

export interface GaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  valueText?: string;
  locale?: string;
  className?: string;
}

/** A bounded semicircle meter; the caller owns the measurement and its unit. */
export function Gauge({ label, value, min = 0, max = 100, unit, valueText, locale = "nl-NL", className }: GaugeProps) {
  const labelId = useId();
  if (![value, min, max].every(Number.isFinite) || max <= min) {
    throw new RangeError("Gauge requires finite values and max greater than min.");
  }
  const boundedValue = Math.min(max, Math.max(min, value));
  const percentage = ((boundedValue - min) / (max - min)) * 100;
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const accessibleValue = valueText ?? `${format.format(boundedValue)}${unit ? ` ${unit}` : ""}`;

  return (
    <div className={cn("w-full max-w-xs text-center text-foreground", className)}>
      <p id={labelId} className="font-sans text-sm font-semibold">{label}</p>
      <div role="meter" aria-labelledby={labelId} aria-valuemin={min} aria-valuemax={max} aria-valuenow={boundedValue} aria-valuetext={accessibleValue} className="relative mt-3">
        <svg viewBox="0 0 220 128" fill="none" aria-hidden="true" className="w-full">
          <path d="M20 118A90 90 0 0 1 200 118" pathLength="100" stroke="var(--bbf-rand)" strokeWidth="16" strokeLinecap="round" />
          {percentage > 0 && <path d="M20 118A90 90 0 0 1 200 118" pathLength="100" stroke="var(--bbf-petrol)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${percentage} 100`} />}
        </svg>
        <p aria-hidden="true" className="absolute inset-x-8 bottom-1 flex flex-wrap items-baseline justify-center gap-x-1 font-mono text-4xl font-medium">
          {format.format(boundedValue)}<span className="text-sm text-muted-foreground">{unit}</span>
        </p>
      </div>
      <div aria-hidden="true" className="mt-2 flex justify-between px-4 font-mono text-xs text-muted-foreground"><span>{format.format(min)}</span><span>{format.format(max)}</span></div>
    </div>
  );
}
