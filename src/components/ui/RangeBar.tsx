import { cn } from "@/utils/cn";

export interface RangeBarProps {
  value: number;
  low: number;
  high: number;
  min?: number;
  max?: number;
  size?: "large" | "compact";
  dashed?: boolean;
  label?: string;
  unit?: string;
  locale?: "nl" | "en";
  ariaLabel?: string;
  className?: string;
}

const motion = "transition-[left,width,padding] duration-[400ms] motion-reduce:transition-none";

/** A read-only interval on a fixed scale. Invalid data never becomes a fabricated result. */
export function RangeBar({
  value,
  low,
  high,
  min = value - 60,
  max = value + 60,
  size = "large",
  dashed = false,
  locale = "nl",
  label = locale === "nl" ? "Zadelhoogte" : "Saddle height",
  unit = "mm",
  ariaLabel,
  className,
}: RangeBarProps) {
  const span = max - min;
  if (![value, low, high, min, max, span].every(Number.isFinite) || span <= 0 || low > high) return null;

  const percent = (number: number) => {
    if (number <= min) return 0;
    if (number >= max) return 100;
    return ((number - min) / span) * 100;
  };
  const left = percent(low);
  const right = percent(high);
  const marker = percent(value);
  const compact = size === "compact";
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const lowLabel = format.format(low);
  const highLabel = format.format(high);
  const measurement = (number: number) => `${format.format(number)}${unit ? ` ${unit}` : ""}`;
  const description = locale === "nl"
    ? `${label} ${measurement(value)}, bereik ${format.format(low)} tot ${measurement(high)}`
    : `${label} ${measurement(value)}, range ${format.format(low)} to ${measurement(high)}`;

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? description}
      className={cn(
        "flex w-full min-w-0 max-w-full flex-col font-mono text-foreground",
        compact ? "gap-1 pt-1.5" : "gap-2 pt-2",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "relative rounded-full border-[1.5px] border-[var(--bbf-gedempt)] bg-muted",
          compact ? "h-4" : "h-7",
        )}
      >
        <div
          data-range-zone=""
          className={cn(
            "absolute -inset-y-[1.5px] rounded-full border-[1.5px] border-[var(--bbf-inkt)] bg-[var(--bbf-lime)]",
            dashed ? "border-dashed" : "border-solid",
            motion,
          )}
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <div
          data-range-marker=""
          className={cn(
            "absolute rounded-[3px] bg-[var(--bbf-inkt)] [.dark_&]:ring-1 [.dark_&]:ring-[var(--bbf-lime)]",
            compact ? "-top-1.5 h-[26px] w-1" : "-top-[9px] h-11 w-[5px]",
            motion,
          )}
          style={{ left: `clamp(0px, calc(${marker}% - ${compact ? 2 : 2.5}px), calc(100% - ${compact ? 4 : 5}px))` }}
        />
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex min-w-0 justify-between gap-1",
          compact ? "min-h-[18px] text-[13px]" : "min-h-[22px] text-base",
          motion,
        )}
        style={{
          paddingLeft: `max(0px, calc(${left}% - ${lowLabel.length / 2}ch))`,
          paddingRight: `max(0px, calc(${100 - right}% - ${highLabel.length / 2}ch))`,
        }}
      >
        <span className="min-w-0 break-all">{lowLabel}</span>
        <span className="min-w-0 break-all text-right">{highLabel}</span>
      </div>
    </div>
  );
}
