import { cn } from "@/utils/cn";

export interface SizeScaleOption {
  value: string | number;
  label?: string;
}

export interface SizeScaleProps {
  label: string;
  options: readonly SizeScaleOption[];
  recommended: string | number;
  borderline?: readonly (string | number)[];
  unit?: string;
  locale?: string;
  recommendedLabel?: string;
  borderlineLabel?: string;
  className?: string;
}

/** Read-only recommendation display, not an input or an engine. */
export function SizeScale({
  label,
  options,
  recommended,
  borderline = [],
  unit,
  locale = "nl-NL",
  recommendedLabel = "advies",
  borderlineLabel = "meetgrens",
  className,
}: SizeScaleProps) {
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  return (
    <ul
      aria-label={label}
      className={cn("m-0 flex w-full min-w-0 max-w-full list-none flex-wrap gap-2 p-0", className)}
    >
      {options.map((option) => {
        const selected = option.value === recommended;
        const boundary = !selected && borderline.includes(option.value);
        return (
          <li
            key={option.value}
            aria-current={selected ? "true" : undefined}
            className={cn(
              "flex min-h-20 min-w-0 max-w-full flex-[1_1_4.5rem] flex-col items-center " +
                "justify-center gap-1 rounded-[0.875rem] border-2 px-2 py-3 text-center",
              selected
                ? "border-[var(--bbf-inkt)] bg-[var(--bbf-inkt)] text-[var(--bbf-wit)] " +
                    "dark:border-primary dark:bg-primary dark:text-primary-foreground"
                : "bg-card text-card-foreground",
              !selected && (boundary ? "border-primary" : "border-transparent"),
            )}
          >
            <span className="max-w-full break-words font-mono text-lg font-medium">
              {option.label ?? (typeof option.value === "number" ? format.format(option.value) : option.value)}
            </span>
            <span className={cn("max-w-full break-words text-xs", selected || boundary ? "font-sans" : "font-mono")}>
              {selected ? recommendedLabel : boundary ? borderlineLabel : unit}
            </span>
            {unit && (selected || boundary) && <span className="sr-only">{unit}</span>}
          </li>
        );
      })}
    </ul>
  );
}
