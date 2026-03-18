import { formatMessage } from "@/i18n/dashboardMessages";
import type { ReportDelta } from "@/lib/reports/reportV2Types";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";

export function getStatusLabel(
  status: "ready" | "pending_data" | "optional",
  copy: ReportV2Copy
): string {
  switch (status) {
    case "ready":
      return copy.status.ready;
    case "pending_data":
      return copy.status.pendingData;
    case "optional":
      return copy.status.optional;
  }
}

export function getDeltaLabel(
  delta: ReportDelta | null,
  copy: ReportV2Copy
): string | null {
  if (!delta) return null;
  if (delta.direction === "neutral") {
    return copy.delta.neutral;
  }
  return formatMessage(
    delta.direction === "increase"
      ? copy.delta.increase
      : copy.delta.decrease,
    { amount: delta.amountMm }
  );
}

export function getSurfaceLabel(
  surface: string | null,
  copy: ReportV2Copy
): string {
  if (!surface) {
    return "n/a";
  }

  switch (surface) {
    case "smooth_asphalt":
      return copy.tirePressure.surfaceValues.smoothAsphalt;
    case "average_asphalt":
      return copy.tirePressure.surfaceValues.averageAsphalt;
    case "rough_asphalt":
      return copy.tirePressure.surfaceValues.roughAsphalt;
    case "hardpack_gravel":
      return copy.tirePressure.surfaceValues.hardpackGravel;
    case "loose_gravel":
      return copy.tirePressure.surfaceValues.looseGravel;
    case "trail":
      return copy.tirePressure.surfaceValues.trail;
    default:
      return surface.replaceAll("_", " ");
  }
}

