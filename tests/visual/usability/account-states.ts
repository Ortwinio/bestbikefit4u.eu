import { calculateBasicPressure } from "../../../src/lib/pressure-engine";
import { groupAdvice, type AdviceSources } from "../../../convex/advice/groupAdvice";
import { PRODUCTS } from "../../../shared/pricing/products";
import { getAccess } from "../../../shared/pricing/access";
import { calculateAccountSaddleHeight } from "../../../shared/reliability/accountSaddle";
import { getReliabilityRange } from "../../../shared/reliability/calculators";

/** Explicit offline data only. Never import this module from application code. */
type FixtureProfile = { userId?: string; heightCm?: number; inseamCm?: number; weightKg?: number };
type FixtureBike = { _id: string; name?: string; advisedPressureSummary?: Record<string, unknown> };
type Input = {
  profile: FixtureProfile; bike: FixtureBike; values: Record<string, unknown>;
  mode: "open" | "free" | "paid"; now?: number; fixture?: string; args?: { sessionId?: string; bikeId?: string };
};
export function readUsabilityAccountState(name: string, { profile, bike, values, mode, fixture = "filled", args, now = 1791244800000 }: Input) {
  const access = getAccess({ entitlements: mode === "paid" ? [{ productId: "annual", status: "active",
    startsAt: now - 86400000, expiresAt: now + 30 * 86400000, source: "purchase",
    appointmentGranted: false }] : [] }, bike._id, { enforced: mode !== "open", now });
  const profileValue = Object.hasOwn(values, "profiles/queries:getMyProfile")
    ? values["profiles/queries:getMyProfile"] as FixtureProfile | null | undefined : profile;
  const currentProfile = profileValue ?? {};
  const inputSnapshot = { discipline: "road" as const, bodyWeightKg: currentProfile.weightKg ?? 74,
    widthFrontMm: 28, widthRearMm: 28, tubeType: "tubeless" as const,
    surface: "average_asphalt" as const, bikeWeightKg: 8.5 };
  const pressureResult = calculateBasicPressure(inputSnapshot);
  const pressure = { _id: "visual-pressure", _creationTime: now, userId: profile.userId ?? "visual-user",
    bikeId: bike._id, createdAt: now, inputSnapshot, recommendedFrontBar: pressureResult.frontBar,
    recommendedRearBar: pressureResult.rearBar, recommendedFrontPsi: pressureResult.frontPsi,
    recommendedRearPsi: pressureResult.rearPsi, warnings: pressureResult.warnings };
  const hasPressure = fixture !== "no-pressure" && fixture !== "empty" && Boolean(profileValue);
  const result = (value: unknown) => ({ handled: true as const, value });
  if (fixture === "loading" && ["calculatorData/queries:get", "reliability/queries:getSaddleState",
    "reliability/queries:getDashboardReliability", "recommendations/queries:getReportV2",
    "advice/queries:listAdviceGroups", "pressureCalculations/queries:getLatestByBikeForUser",
    "pressureCalculations/queries:getLatestWithoutBikeForUser"].includes(name)) return result(undefined);
  const observations = ["heightCm", "inseamCm", "weightKg"]
    .flatMap(field => {
      const value = currentProfile[field as keyof FixtureProfile];
      return typeof value === "number" ? [{ field, value, kind: "measured" as const,
        method: "single_measurement", recordedAt: now, repeatCount: 1, withinTolerance: false,
        unit: field === "weightKg" ? "kg" : "cm", source: "profile_edit", status: "current" }] : [];
    });
  if (name === "pricing/queries:getAccess") return { handled: true, value: access };
  if (name === "pricing/queries:getSubscription") return result({ access, transitionOffer: null,
    entitlements: mode === "paid" ? [{ _id: "visual-entitlement", productId: "annual", status: "active",
      startsAt: now - 86400000, expiresAt: now + 30 * 86400000, source: "purchase",
      appointmentGranted: false, periodPriceCents: PRODUCTS.annual.priceCents }] : [] });
  if (name === "recommendations/queries:getReportAccess") {
    type Report = { session?: { _id?: string; userId?: string; createdAt?: number };
      recommendation?: { legacyFullAccess?: boolean; createdAt?: number } | null };
    const direct = values["recommendations/queries:getReportV2"] as Report | null | undefined;
    const history = (values["sessions/queries:getAllSessionsWithBikes"]
      ?? values["sessions/queries:getSessionsWithRecommendationsByBike"] ?? []) as Report[];
    const reports = [...(direct ? [direct] : []), ...history].filter(report =>
      report.session?.userId === (profile.userId ?? "visual-user") && report.recommendation);
    if (fixture === "report-loading" || fixture === "loading") return result(undefined);
    const report = reports.find(item => item.session?._id === args?.sessionId);
    if (!report) return result(null);
    const latest = [...reports].sort((a, b) =>
      (b.recommendation?.createdAt ?? b.session?.createdAt ?? 0)
      - (a.recommendation?.createdAt ?? a.session?.createdAt ?? 0))[0];
    const isLatestReport = latest.session?._id === report.session?._id;
    const legacyFullAccess = report.recommendation?.legacyFullAccess === true;
    const fullReport = access.fullReport || legacyFullAccess;
    return result({ enforced: access.enforced, fullReport, legacyFullAccess, isLatestReport,
      canDownloadPdf: fullReport || isLatestReport, canEmailReport: fullReport || isLatestReport });
  }
  if (name === "calculatorData/queries:get") return { handled: true, value: {
    userId: profile.userId ?? "visual-user", entries: observations.map(item => ({ field: item.field, value: item.value, unit: item.unit,
      calculator: "bike-fit", method: "measured", kind: item.kind, measurementMethod: item.method,
      repeatCount: item.repeatCount, withinTolerance: item.withinTolerance, touchedAt: item.recordedAt })),
  } };
  if (name === "reliability/queries:getSaddleState") {
    if (!profileValue) return result({ profile: profileValue, observations: [], measurements: [], model: null,
      latestKneeAngle: null, preferences: null, canUseKneeAngle: access.fullReport });
    const model = calculateAccountSaddleHeight({ heightCm: currentProfile.heightCm, inseamCm: currentProfile.inseamCm,
      provenance: { kind: "measured", method: "single_measurement", repeatCount: 1 }, bikeType: "road" });
    return { handled: true, value: { profile: currentProfile, bike, observations, measurements: [], model,
      latestKneeAngle: null, canUseKneeAngle: access.fullReport,
      preferences: { bikeType: "road", goal: "balanced", climbing: "none" }, preferencesUpdatedAt: now } };
  }
  if (name === "recommendations/queries:getReportV2") {
    const source = values[name] as { recommendation?: { calculatedFit?: Record<string, number> } } | null;
    if (!source) return { handled: true, value: source };
    return { handled: true, value: { ...source,
      recommendation: source.recommendation && !access.fullReport ? { ...source.recommendation,
        fitNotes: [], adjustmentPriorities: [], recommendationItems: [], climbingCalculatedFit: undefined,
      } : source.recommendation,
      latestPressureCalculation: hasPressure ? pressure : null,
      reliabilityEvidence: { inseamCm: currentProfile.inseamCm,
        inseamProvenance: { kind: "measured", method: "single_measurement", repeatCount: 1 } },
      access: { ...access, isLatestReport: true, canDownloadPdf: true, canEmailReport: true },
    } };
  }
  if (name === "advice/queries:listAdviceGroups") {
    // The production pure grouping function derives the two tyre rows from real engine output.
    return result(groupAdvice({ bikes: [{ ...bike, userId: profile.userId }], profile: profileValue ? { ...profileValue, _creationTime: now } : null,
      observations: [], recommendations: [], saddleWidth: [], gearing: [], states: [],
      pressure: hasPressure ? [pressure] : [] } as unknown as AdviceSources, now));
  }
  if (name === "pressureCalculations/queries:getLatestForBike") {
    return result(hasPressure && (!args?.bikeId || args.bikeId === bike._id) ? pressure : null);
  }
  if (name === "pressureCalculations/queries:getLatestByBikeForUser") {
    return result(hasPressure ? [{ bikeId: bike._id, latestCalculation: pressure }] : []);
  }
  if (name === "pressureCalculations/queries:getLatestWithoutBikeForUser") return result(null);
  if (name === "calculatorStates/queries:get" && !(name in values)) return result(null);
  if (name === "reliability/queries:getDashboardReliability") {
    const source = values["recommendations/queries:getReportV2"] as {
      recommendation?: { calculatedFit?: Record<string, number> };
    } | undefined;
    const fit = source?.recommendation?.calculatedFit;
    if (!fit) return { handled: true, value: null };
    const definitions = [
      ["A", "saddleHeight", "saddleHeightMm"], ["B", "saddleSetback", "saddleSetbackMm"],
      ["C", "handlebarDrop", "handlebarDropMm"], ["D", "reach", "handlebarReachMm"],
    ] as const;
    return { handled: true, value: { sessionId: "visual-session", largestGain: null,
      rows: definitions.filter(([letter,, field]) => Number.isFinite(fit[field]) && (access.fullReport || letter === "A"))
        .map(([letter, metric, field]) => ({ letter, metric, value: fit[field], range: getReliabilityRange({
          metric, value: fit[field], evidence: { inseamCm: profile.inseamCm,
            inseamProvenance: { kind: "measured", method: "single_measurement" } },
        }) })),
    } };
  }
  return { handled: false };
}
