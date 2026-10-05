"use client";

import { useConvexAuth, useQuery } from "convex/react";
import type { Locale } from "@/i18n/config";
import { api } from "../../../convex/_generated/api";
import type { saddleState } from "../../../convex/reliability/state";
import type { ScoreObservation } from "../../../shared/profileScore/types";
import { checkInseamPlausibility } from "../../../shared/reliability/saddleHeight";
import { getReliabilityRange } from "../../../shared/reliability/calculators";
import { DashboardReportMeasurement, type DashboardReportMeasurementData } from "./DashboardReportMeasurement";
import { dashboardMeasurementOrigin } from "./DashboardReportReliabilityMapping";

export function mapDashboardReportMeasurement(state: Awaited<ReturnType<typeof saddleState>>, locale: Locale): DashboardReportMeasurementData {
  const valueCm = state.profile?.inseamCm ?? null;
  const observation: ScoreObservation | undefined = state.observations.find(entry => entry.field === "inseamCm");
  const provenance = state.model?.provenance;
  const origin = dashboardMeasurementOrigin(observation, locale);
  const plausibility = state.profile?.heightCm != null && valueCm !== null
    ? checkInseamPlausibility(state.profile.heightCm, valueCm) : null;
  const check = provenance?.unresolvedWarning ? "warning"
    : (provenance?.repeatCount ?? 0) >= 2 && provenance?.withinTolerance === false ? "inconsistent"
      : plausibility?.status === "ok" ? "ok"
        : plausibility?.status === "check" && provenance?.unresolvedWarning === false ? "confirmed"
          : plausibility ? "warning" : "unknown";
  const repeated = valueCm !== null && state.model && !state.model.canCheckKneeAngle
    ? getReliabilityRange({ metric: "saddleHeight", value: state.model.adviceMm,
      evidence: { inseamCm: valueCm, inseamProvenance: {
        kind: "measured", repeatCount: 3, withinTolerance: true,
      } } }) : null;
  return { valueCm, origin, check,
    recordedAt: origin !== null ? observation?.recordedAt ?? null : null,
    currentHalfWidth: valueCm !== null ? state.model?.halfWidthMm ?? null : null,
    repeatedHalfWidth: repeated?.halfWidth ?? null };
}

export function DashboardReportMeasurementPanel({ locale }: { locale: Locale }) {
  const { isAuthenticated } = useConvexAuth();
  const state = useQuery(api.reliability.queries.getSaddleState, isAuthenticated ? {} : "skip");
  if (!isAuthenticated || !state?.profile) return null;
  return <DashboardReportMeasurement measurement={mapDashboardReportMeasurement(state, locale)} locale={locale} />;
}
