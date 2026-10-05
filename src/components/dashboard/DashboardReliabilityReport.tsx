import Link from "next/link";
import { RangeBar } from "@/components/ui/RangeBar";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getReliabilityDashboardCopy } from "@/i18n/account/reliabilityDashboard";

const parameters = ["saddleHeight", "saddleSetback", "handlebarDrop", "handlebarReach"] as const;

export type DashboardReliabilityRow = {
  key: typeof parameters[number];
  value: number;
  low: number;
  high: number;
  min: number;
  max: number;
  halfWidth: number;
  dashed?: boolean;
  basis: string;
};

export type DashboardGreatestGain = { text: string; href: string };

export function DashboardReliabilityReport({ rows, greatestGain, locale }: {
  rows: readonly DashboardReliabilityRow[];
  greatestGain: DashboardGreatestGain | null;
  locale: Locale;
}) {
  const copy = getReliabilityDashboardCopy(locale);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const usableRows = parameters.flatMap((key, index) => {
    const row = rows.find(candidate => candidate.key === key);
    if (!row || ![row.value, row.low, row.high, row.min, row.max, row.halfWidth].every(Number.isFinite)
      || row.low > row.high || row.max <= row.min || row.halfWidth < 0) return [];
    return [{ ...row, letter: String.fromCharCode(65 + index) }];
  });

  if (!usableRows.length) return <p className="text-sm text-muted-foreground">{copy.unavailable}</p>;

  return <div className="min-w-0 space-y-3">
    <p className="text-sm text-muted-foreground">{copy.range}</p>
    <dl className="divide-y divide-border">
      {usableRows.map(row => <div key={row.key} data-reliability-row={row.key}
        className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 py-4">
        <dt className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-accent-foreground">
            {row.letter}
          </span>
          {copy.parameters[row.key]}
        </dt>
        <dd className="text-right font-mono text-xl text-foreground">
          {number.format(row.value)}<span className="ml-1 text-xs">mm</span>
          <span className="block text-xs text-muted-foreground">± {number.format(row.halfWidth)} mm</span>
        </dd>
        <dd className="col-span-2 min-w-0">
          <RangeBar value={row.value} low={row.low} high={row.high} min={row.min} max={row.max}
            size="compact" dashed={row.dashed} label={copy.parameters[row.key]} locale={locale} />
          <p className="mt-1 text-xs text-muted-foreground">{copy.basedOn}: {row.basis || copy.missing}</p>
        </dd>
      </div>)}
    </dl>
    {greatestGain && <Link href={withLocalePrefix(greatestGain.href, locale)}
      className="flex min-h-11 items-center gap-2 rounded-2xl bg-accent p-4 text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
      <span aria-hidden="true">→</span>
      <span>{copy.greatestGain}: {greatestGain.text}</span>
    </Link>}
  </div>;
}
