"use client";

import { toPercentBucket } from "@/lib/uiPercent";
import { cn } from "@/utils/cn";

export type ScaleSliderOption = {
  key: string;
  label: string;
};

type ScaleSliderQuestionProps = {
  label: string;
  description?: string;
  options: ScaleSliderOption[];
  value: string | null;
  onChange: (key: string) => void;
  className?: string;
};

type ReadOnlyScaleSliderProps = {
  label: string;
  options: ScaleSliderOption[];
  value: string | null;
  className?: string;
};

function getFillPercent(selectedIndex: number, optionCount: number) {
  if (selectedIndex < 0 || optionCount <= 1) return 0;
  return (selectedIndex / (optionCount - 1)) * 100;
}

function getGridColumnClassName(optionCount: number) {
  switch (optionCount) {
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 5:
      return "grid-cols-5";
    case 6:
      return "grid-cols-6";
    default:
      return "grid-cols-5";
  }
}

export function ReadOnlyScaleSlider({
  label,
  options,
  value,
  className,
}: ReadOnlyScaleSliderProps) {
  const selectedIndex = value ? options.findIndex((option) => option.key === value) : -1;
  const fillPercent = getFillPercent(selectedIndex, options.length);
  const fillBucket = toPercentBucket(fillPercent);
  const gridColumnClassName = getGridColumnClassName(options.length);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[color:var(--muted-foreground)]">{label}</p>
        {value ? (
          <span className="text-xs font-semibold text-primary">
            {options.find((option) => option.key === value)?.label}
          </span>
        ) : null}
      </div>
      <div className="relative flex h-6 items-center justify-between px-1">
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/15" />
        {selectedIndex >= 0 ? (
          <div
            className="csp-scale-fill pointer-events-none absolute left-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/60"
            data-scale-pct={fillBucket}
          />
        ) : null}
        {options.map((option, index) => {
          const isActive = index === selectedIndex;

          return (
            <div
              key={option.key}
              className={cn(
                "relative z-10 rounded-full bg-primary transition-all duration-200",
                isActive
                  ? "size-4 border-2 border-background shadow-sm ring-2 ring-primary"
                  : "size-2 opacity-30"
              )}
            />
          );
        })}
      </div>
      <div className={cn("grid text-xs", gridColumnClassName)}>
        {options.map((option, index) => (
          <span
            key={option.key}
            className={cn(
              "leading-tight",
              index === 0 ? "text-left" : index === options.length - 1 ? "text-right" : "text-center",
              option.key === value ? "font-semibold text-primary" : "text-muted-foreground"
            )}
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ScaleSliderQuestion({
  label,
  description,
  options,
  value,
  onChange,
  className,
}: ScaleSliderQuestionProps) {
  const selectedIndex = value ? options.findIndex((option) => option.key === value) : -1;
  const fillPercent = getFillPercent(selectedIndex, options.length);
  const fillBucket = toPercentBucket(fillPercent);
  const gridColumnClassName = getGridColumnClassName(options.length);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
          {description ? (
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">{description}</p>
          ) : null}
        </div>
        {value ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {options.find((option) => option.key === value)?.label}
          </span>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="relative flex h-10 items-center justify-between px-1"
      >
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/15" />
        {selectedIndex >= 0 ? (
          <div
            className="csp-scale-fill pointer-events-none absolute left-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-300 ease-out"
            data-scale-pct={fillBucket}
          />
        ) : null}
        {options.map((option, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.key)}
              className={cn(
                "relative z-10 rounded-full bg-primary transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isActive
                  ? "size-6 border-4 border-background shadow-md"
                  : "size-3 opacity-50 hover:opacity-100"
              )}
            />
          );
        })}
      </div>
      <div className={cn("grid text-xs font-medium", gridColumnClassName)}>
        {options.map((option, index) => (
          <span
            key={option.key}
            className={cn(
              "cursor-pointer leading-tight transition-colors duration-150",
              index === 0 ? "text-left" : index === options.length - 1 ? "text-right" : "text-center",
              option.key === value ? "font-semibold text-primary" : "text-muted-foreground"
            )}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}
