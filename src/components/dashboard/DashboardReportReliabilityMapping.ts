import type { Locale } from "@/i18n/config";
import { getReliabilityDashboardCopy } from "@/i18n/account/reliabilityDashboard";
import type { ReliabilityMetric, ReliabilityRange } from "../../../shared/reliability/calculators";
import type { ScoreObservation } from "../../../shared/profileScore/types";
import type { DashboardGreatestGain, DashboardReliabilityRow } from "./DashboardReliabilityReport";

const metricKeys = {
  saddleHeight: "saddleHeight", saddleSetback: "saddleSetback",
  handlebarDrop: "handlebarDrop", reach: "handlebarReach",
} as const;

export function mapDashboardReliabilityRows(ranges: readonly ReliabilityRange[], locale: Locale,
  unresolvedWarning = false): DashboardReliabilityRow[] {
  const copy = getReliabilityDashboardCopy(locale);
  return ranges.flatMap(range => {
    if (range.kind !== "continuous" || !Object.hasOwn(metricKeys, range.metric)) return [];
    const key = metricKeys[range.metric as keyof typeof metricKeys];
    const basis = copy.basis[key] as Record<string, string>;
    return [{ key, value: range.value, low: range.lower, high: range.upper,
      min: range.scaleMin, max: range.scaleMax, halfWidth: range.halfWidth,
      dashed: (unresolvedWarning || range.nextStepKey === "remeasure") && key === "saddleHeight",
      basis: basis[range.basisKey] ?? copy.missing }];
  });
}

export function mapDashboardGreatestGain(gain: {
  metric: ReliabilityMetric; nextStepKey: string; halfWidth: number;
} | null, locale: Locale): DashboardGreatestGain | null {
  if (!gain || !Object.hasOwn(metricKeys, gain.metric) || !Number.isFinite(gain.halfWidth) || gain.halfWidth < 0) return null;
  const copy = getReliabilityDashboardCopy(locale);
  const action = (copy.actions as Record<string, string>)[gain.nextStepKey];
  if (!action || gain.nextStepKey === "narrowest-online") return null;
  const key = metricKeys[gain.metric as keyof typeof metricKeys];
  const width = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(gain.halfWidth);
  return { text: `${action} → ${copy.parameters[key]} ± ${width} mm`,
    href: key === "saddleHeight" ? "/tools/saddle-height" : "/profile" };
}

export function dashboardMeasurementOrigin(observation: ScoreObservation | null | undefined, locale: Locale): string | null {
  if (!observation?.kind || observation.method?.startsWith("legacy_")) return null;
  const copy = getReliabilityDashboardCopy(locale);
  const kind = observation.kind;
  const label = kind === "measured" && observation.method === "fitter" ? copy.fitter
    : kind === "measured" && observation.method === "video" ? copy.video : copy[kind];
  return kind === "measured" && Number.isInteger(observation.repeatCount) && observation.repeatCount! > 0
    ? `${label}, ${observation.repeatCount}×` : label;
}
