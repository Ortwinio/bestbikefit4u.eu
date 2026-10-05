import { RangeBar } from "@/components/ui/RangeBar";
import type { Locale } from "@/i18n/config";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import type { ReliabilityRange } from "../../../shared/reliability/calculators";

export interface ReliabilityResultRow {
  label: string;
  unit: string;
  range: ReliabilityRange;
  basis: string;
  letter?: string;
  dashed?: boolean;
  optionLabels?: readonly string[];
}

export function ReliabilityResultRows({ rows, locale }: { rows: ReliabilityResultRow[]; locale: Locale }) {
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const copy = reliabilityMessages[locale];
  return <div className="divide-y divide-border">
    {rows.map(({ label, range, unit, basis, letter, dashed, optionLabels }) => {
      const options = range.kind === "size" ? range.options : [];
      const labels = options.map((option, index) => optionLabels?.[index] ?? format.format(option));
      const selected = options.indexOf(range.value);
      const selectedLabel = labels[selected] ?? format.format(range.value);
      return <article key={label} className="min-w-0 py-5 first:pt-0" data-reliability-result={range.metric}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          {letter && <span className="rounded-full bg-muted px-2 font-mono">{letter}</span>}{label}
        </h2>
        <div className="my-3 flex flex-wrap items-baseline justify-between gap-2 font-mono">
          <p className="text-3xl font-medium tracking-tight sm:text-4xl">
            {range.kind === "size" ? selectedLabel : format.format(range.value)}
            {unit && <span className="ml-2 text-sm text-muted-foreground">{unit}</span>}
          </p>
          {range.kind === "continuous" && <p className="text-lg">±{format.format(range.halfWidth)}
            <span className="ml-1 text-sm text-muted-foreground">{unit}</span></p>}
        </div>
        {range.kind === "continuous" ? <RangeBar value={range.value} low={range.lower} high={range.upper}
          min={range.scaleMin} max={range.scaleMax} label={label} locale={locale} unit={unit} dashed={dashed} />
          : <div role="img" aria-label={`${label}: ${selectedLabel}${unit ? ` ${unit}` : ""}; ${
            range.eligibleIndices.map(index => labels[index]).join(" – ")}`} className="py-2">
            <div className="relative h-7 rounded-full border border-muted-foreground bg-muted" aria-hidden="true">
              <div className="absolute -inset-y-px rounded-full border border-[var(--bbf-inkt)] bg-[var(--bbf-lime)]"
                style={{ left: `${range.eligibleIndices[0] / options.length * 100}%`,
                  width: `${(range.eligibleIndices.at(-1)! - range.eligibleIndices[0] + 1) / options.length * 100}%` }} />
              {options.slice(1).map((option, index) => <span key={option}
                className="absolute inset-y-1.5 w-px bg-muted-foreground opacity-40"
                style={{ left: `${(index + 1) / options.length * 100}%` }} />)}
              <span className="absolute -top-2 h-11 w-1 rounded bg-[var(--bbf-inkt)] [.dark_&]:ring-1 [.dark_&]:ring-[var(--bbf-lime)]"
                style={{ left: `calc(${(Math.max(0, selected) + 0.5) / options.length * 100}% - 2px)` }} />
            </div>
            <div className="mt-3 grid font-mono text-xs sm:text-sm" aria-hidden="true"
              style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
              {labels.map((text, index) => <span key={options[index]} className={
                `text-center ${range.eligibleIndices.includes(index) ? "font-medium" : "text-muted-foreground"}`
              }>{text}</span>)}
            </div>
          </div>}
        <p className="mt-3 text-sm text-muted-foreground">{copy.basedOn}: {basis}</p>
      </article>;
    })}
  </div>;
}
