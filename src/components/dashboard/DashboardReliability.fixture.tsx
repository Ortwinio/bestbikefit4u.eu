import type { Locale } from "@/i18n/config";
import { getReliabilityRange } from "../../../shared/reliability/calculators";
import { DashboardReliabilityReport } from "./DashboardReliabilityReport";
import { DashboardReportMeasurement } from "./DashboardReportMeasurement";
import { mapDashboardGreatestGain, mapDashboardReliabilityRows } from "./DashboardReportReliabilityMapping";

export const dashboardReliabilityFixture = {
  sessionId: "fixture-session",
  rows: [
    { letter: "A", metric: "saddleHeight", value: 787, range: getReliabilityRange({
      metric: "saddleHeight", value: 787, evidence: { inseamCm: 89, inseamProvenance: { kind: "measured", repeatCount: 1 } },
    }) },
    { letter: "B", metric: "saddleSetback", value: 51, range: getReliabilityRange({ metric: "saddleSetback", value: 51 }) },
    { letter: "C", metric: "handlebarDrop", value: 97, range: getReliabilityRange({
      metric: "handlebarDrop", value: 97, evidence: { flexibilityAndCoreAssessed: true },
    }) },
    { letter: "D", metric: "reach", value: 569, range: getReliabilityRange({
      metric: "reach", value: 569, evidence: { torsoAndArmMeasured: true, bikeGeometryKnown: true },
    }) },
  ],
  largestGain: { metric: "saddleHeight" as const, nextStepKey: "repeat-inseam", halfWidth: 18, reduction: 5 },
};

export function DashboardReliabilityFixture({ locale, scenario = "measured" }: {
  locale: Locale;
  scenario?: "measured" | "warning" | "missing";
}) {
  const missing = scenario === "missing";
  const warning = scenario === "warning";
  const ranges = dashboardReliabilityFixture.rows.flatMap(row => {
    if (!row.range) return [];
    if (warning && row.metric === "saddleHeight") {
      const range = getReliabilityRange({ metric: "saddleHeight", value: row.value,
        evidence: { inseamCm: 89, inseamProvenance: { kind: "measured", unresolvedWarning: true } } });
      return range ? [range] : [];
    }
    return [row.range];
  });
  return <main className="mx-auto grid w-full max-w-6xl min-w-0 items-start gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <section className="min-w-0 rounded-3xl border border-border bg-card p-5">
      <h1 className="mb-3 font-display text-2xl font-bold">{locale === "nl" ? "Jouw afstelling" : "Your setup"} · Canyon Aeroad</h1>
      <DashboardReliabilityReport locale={locale} rows={missing ? [] : mapDashboardReliabilityRows(ranges, locale, warning)}
        greatestGain={missing ? null : mapDashboardGreatestGain({ ...dashboardReliabilityFixture.largestGain,
          nextStepKey: warning ? "remeasure" : "repeat-inseam" }, locale)} />
    </section>
    <section>
    <h2 className="sr-only">{locale === "nl" ? "Mijn profiel" : "My profile"}</h2>
    <DashboardReportMeasurement locale={locale} measurement={{ valueCm: missing ? null : 89,
      origin: missing ? null : locale === "nl" ? "Zelf gemeten, 1×" : "Self-measured, 1×",
      recordedAt: missing ? null : Date.UTC(2026, 9, 3, 12), check: missing ? "unknown" : warning ? "warning" : "ok",
      currentHalfWidth: missing ? null : ranges.find(range => range.metric === "saddleHeight")?.halfWidth,
      repeatedHalfWidth: missing ? null : 18 }} />
    </section>
  </main>;
}
