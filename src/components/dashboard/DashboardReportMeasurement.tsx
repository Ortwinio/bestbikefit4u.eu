import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getReliabilityDashboardCopy } from "@/i18n/account/reliabilityDashboard";

export type DashboardReportMeasurementData = {
  valueCm: number | null;
  origin: string | null;
  recordedAt: number | null;
  check: "ok" | "confirmed" | "warning" | "inconsistent" | "unknown";
  currentHalfWidth?: number | null;
  repeatedHalfWidth?: number | null;
};

export function DashboardReportMeasurement({ measurement, locale }: {
  measurement: DashboardReportMeasurementData;
  locale: Locale;
}) {
  const copy = getReliabilityDashboardCopy(locale);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const date = measurement.recordedAt !== null && measurement.recordedAt > 0 ? new Date(measurement.recordedAt) : null;
  const validDate = date !== null && Number.isFinite(date.getTime()) ? date : null;
  const current = measurement.currentHalfWidth;
  const repeated = measurement.repeatedHalfWidth;

  return <aside aria-label={copy.profile} className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-5">
    <h3 className="text-sm font-semibold text-primary">{copy.profile}</h3>
    <dl className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <dt className="font-semibold">{copy.inseam}</dt>
        <dd className="font-mono text-2xl">{measurement.valueCm !== null && Number.isFinite(measurement.valueCm)
          ? `${number.format(measurement.valueCm)} cm` : copy.missing}</dd>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 text-sm">
        <dt className="text-muted-foreground">{copy.origin}</dt><dd>{measurement.origin || copy.missing}</dd>
        <dt className="text-muted-foreground">{copy.date}</dt>
        <dd>{validDate ? <time dateTime={validDate.toISOString()}>{new Intl.DateTimeFormat(locale, {
          day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam",
        }).format(validDate)}</time> : copy.missing}</dd>
        <dt className="text-muted-foreground">{copy.check}</dt><dd>{copy.checks[measurement.check]}</dd>
      </div>
    </dl>
    {current != null && Number.isFinite(current) && current >= 0 && <p className="rounded-xl bg-background p-3 text-sm">
      {copy.impactNow} ± {number.format(current)} mm{repeated != null && Number.isFinite(repeated) && repeated >= 0 && repeated < current
        ? `, ${copy.impactAfter} ± ${number.format(repeated)} mm.` : "."}
    </p>}
    <Link href={withLocalePrefix("/tools/saddle-height", locale)}
      className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring">
      {copy.measureAgain}
    </Link>
  </aside>;
}
