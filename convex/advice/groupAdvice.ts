import type { Doc } from "../_generated/dataModel";
import { ADVICE_GROUPS, type AdviceGroup, type AdviceGroupKey, type AdviceItem, type AdviceProgress, type AdviceSource, type InputDependency,
  type InputProvenance } from "../../shared/advice/types";
import { isStale } from "../../shared/advice/staleness";
import { scoreRiderProfile } from "../../shared/profileScore";
import { legacyRiderObservations } from "../../shared/profileObservationMigration";

type Outcome = { _id: string; bikeId?: string; createdAt: number; inputProvenance?: InputProvenance;
  adviceRevision?: number; adviceProgress?: AdviceProgress[] };
export type AdviceSources = {
  recommendations: Doc<"recommendations">[]; saddleWidth: Doc<"saddleWidthSessions">[];
  gearing: Doc<"gearingSessions">[]; pressure: Doc<"pressureCalculations">[]; states: Doc<"calculatorStates">[];
  bikes: Doc<"bikes">[]; profile: Doc<"profiles"> | null; observations: Doc<"profileObservations">[];
  tireSetups?: Doc<"tireSetups">[]; wheelsets?: Doc<"wheelsets">[];
  rideFeedback?: Doc<"rideFeedbackEntries">[];
};
export function latestByBike<Row extends { bikeId?: string; createdAt: number; _creationTime?: number }>(rows: Row[]): Row[] {
  const latest = new Map<string, Row>();
  for (const row of rows) {
    const key = row.bikeId ?? "rider";
    const previous = latest.get(key);
    if (!previous || previous.createdAt < row.createdAt || (previous.createdAt === row.createdAt
      && (previous._creationTime ?? 0) <= (row._creationTime ?? 0))) latest.set(key, row);
  }
  return [...latest.values()];
}
export function readField(value: unknown, field: string): unknown {
  return field.split(".").reduce<unknown>((current, key) =>
    current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, value);
}
function number(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null; }
function calculatorLink(path: string, bikeId?: string) {
  return bikeId ? `${path}?${new URLSearchParams({ bikeId })}` : path;
}
export function currentDependencies(provenance: InputProvenance | undefined, sources: AdviceSources): InputDependency[] {
  return (provenance?.dependencies ?? []).flatMap(dependency => {
    let owner: unknown = dependency.bikeId ? sources.bikes.find(bike => bike._id === dependency.bikeId) : sources.profile;
    if (dependency.record) {
      const wheel = dependency.record.table === "wheelsets"
        ? sources.wheelsets?.find(row => row._id === dependency.record!.id)
        : sources.wheelsets?.find(row => row._id === sources.tireSetups?.find(tire => tire._id === dependency.record!.id)?.wheelsetId);
      if (!wheel || (dependency.bikeId && wheel.bikeId !== dependency.bikeId)
        || !sources.bikes.some(bike => bike._id === wheel.bikeId && bike.userId === wheel.userId)) return [];
      owner = dependency.record.table === "wheelsets" ? wheel
        : sources.tireSetups?.find(row => row._id === dependency.record!.id && row.userId === wheel.userId);
    }
    if (!owner) return [];
    const storedValue = readField(owner, dependency.field);
    const value = storedValue === undefined && dependency.record ? null : storedValue;
    if (value === undefined) return [];
    const observation = dependency.record ? undefined : sources.observations.filter(entry => entry.status === "current"
      && entry.field === dependency.field && entry.bikeId === dependency.bikeId)
      .sort((left, right) => right.recordedAt - left.recordedAt)[0];
    return [{ field: dependency.field, ...(dependency.bikeId ? { bikeId: dependency.bikeId } : {}),
      ...(dependency.record ? { record: dependency.record } : {}),
      value: value as InputDependency["value"], ...(observation ? { observationId: observation._id } : {}) }];
  });
}

export function groupAdvice(sources: AdviceSources, now: number): AdviceGroup[] {
  const groups: AdviceGroup[] = ADVICE_GROUPS.map(key => ({ key, titleKey: key, items: [], improvements: [] }));
  const add = (group: AdviceGroupKey, row: Outcome, key: string, value: unknown, unit: string | null,
    sourceLink: string, options: { min?: number; max?: number; current?: unknown; confidence?: number;
      changeOrder?: number; saved?: boolean } = {}) => {
    const numeric = number(value);
    const displayValue = numeric ?? (typeof value === "string" && value.trim() ? value : null);
    if (displayValue === null && !options.saved) return;
    const current = number(options.current);
    const staleness = isStale(row.inputProvenance, currentDependencies(row.inputProvenance, sources));
    const progress = options.saved ? undefined : row.adviceProgress?.find(entry => entry.key === key);
    const source: AdviceSource = sources.recommendations.some(entry => entry._id === row._id) ? "recommendations"
      : sources.saddleWidth.some(entry => entry._id === row._id) ? "saddleWidthSessions"
      : sources.gearing.some(entry => entry._id === row._id) ? "gearingSessions"
      : sources.pressure.some(entry => entry._id === row._id) ? "pressureCalculations" : "calculatorStates";
    const recommendation = sources.recommendations.find(entry => entry._id === row._id);
    const eligibleRideFeedback = recommendation && progress ? (sources.rideFeedback ?? []).filter(feedback =>
      feedback.userId === recommendation.userId && feedback.sessionId === recommendation.sessionId
      && feedback.bikeId === recommendation.bikeId && feedback.createdAt >= progress.performedAt && feedback.createdAt <= now)
      .sort((left, right) => right.createdAt - left.createdAt).slice(0, 5)
      .map(feedback => ({ id: feedback._id, date: feedback.createdAt, ...(feedback.notes ? { note: feedback.notes } : {}) })) : [];
    const item: AdviceItem = { id: `${row._id}:${key}`, recordId: row._id, key, bikeId: row.bikeId ?? null,
      source, adviceRevision: row.adviceRevision ?? 0, ...(progress ? { progress } : {}), eligibleRideFeedback,
      value: displayValue, unit, range: options.min !== undefined && options.max !== undefined
        ? { min: options.min, max: options.max } : null,
      current, difference: numeric !== null && current !== null ? numeric - current : null,
      reliability: { value: options.confidence === undefined ? null : Math.min(100, Math.max(0, options.confidence)),
        reason: options.saved ? "saved_inputs_only" : options.confidence === undefined ? "unknown" : "engine_confidence" },
      status: options.saved ? "needs_calculation" : staleness.stale ? "stale"
        : progress ? progress.feedback ? "performed" : "waiting_feedback" : "new",
      date: row.createdAt, staleness, sourceLink, changeOrder: options.changeOrder ?? 1000 };
    groups.find(candidate => candidate.key === group)!.items.push(item);
  };
  const parameters: Array<[string, AdviceGroupKey, string]> = [
    ["saddleHeightMm", "seating", "saddleHeightMm"], ["saddleSetbackMm", "seating", "saddleSetbackMm"],
    ["handlebarDropMm", "cockpit", "handlebarDropMm"], ["handlebarReachMm", "cockpit", "handlebarReachMm"],
    ["stemLengthMm", "cockpit", "stemLengthMm"], ["handlebarWidthMm", "contact", "handlebarWidthMm"],
    ["crankLengthMm", "drivetrain", "crankLengthMm"], ["recommendedStackMm", "frame", "stackMm"],
    ["recommendedReachMm", "frame", "reachMm"],
  ];
  for (const row of latestByBike(sources.recommendations)) {
    const bike = sources.bikes.find(candidate => candidate._id === row.bikeId);
    for (const [parameter, group, currentField] of parameters) {
      const alias = parameter === "handlebarDropMm" ? "barDropMm"
        : parameter === "handlebarReachMm" ? "saddleToBarReachMm" : parameter;
      const detail = row.recommendationItems?.find(item => item.parameter === parameter || item.parameter === alias);
      add(group, row, parameter, detail?.target ?? readField(row.calculatedFit, parameter), "mm", `/fit/${row.sessionId}/results`, {
        confidence: detail?.confidence === undefined ? row.confidenceScore : detail.confidence * 100,
        changeOrder: detail?.changeOrder,
        current: readField(bike, `${group === "frame" ? "currentGeometry" : "currentSetup"}.${currentField}`),
        min: detail?.rangeLow ?? (parameter === "saddleHeightMm" ? row.calculatedFit.saddleHeightRange.min : undefined),
        max: detail?.rangeHigh ?? (parameter === "saddleHeightMm" ? row.calculatedFit.saddleHeightRange.max : undefined),
      });
    }
  }
  for (const row of latestByBike(sources.saddleWidth)) add("contact", row, "saddleWidthMm", row.recommendedWidthMm,
    "mm", calculatorLink("/saddle-selector", row.bikeId), { min: row.widthRangeMinMm, max: row.widthRangeMaxMm,
      current: row.currentSaddleWidthMm, confidence: row.confidenceScore });
  for (const row of latestByBike(sources.gearing)) add("drivetrain", row, "gearRangePercent", row.math.rangePercent, "%", calculatorLink("/gearing", row.bikeId),
    { confidence: row.suitability.confidence.score });
  for (const row of latestByBike(sources.pressure)) {
    add("tires", row, "pressureFrontBar", row.recommendedFrontBar, "bar", calculatorLink("/pressure-calculator", row.bikeId), { current: row.currentFrontBar });
    add("tires", row, "pressureRearBar", row.recommendedRearBar, "bar", calculatorLink("/pressure-calculator", row.bikeId), { current: row.currentRearBar });
  }
  for (const calculator of new Set(sources.states.map(state => state.calculator))) {
    for (const row of latestByBike(sources.states.filter(state => state.calculator === calculator)
      .map(state => ({ ...state, createdAt: state.updatedAt })))) {
      const group = calculator === "saddle-height" || calculator === "bike-fit" ? "seating"
        : calculator === "frame-size" ? "frame" : calculator === "crank-length" ? "drivetrain" : "performance";
      if (row.adviceOutput?.length) {
        const bikeFitGroups: Record<string, AdviceGroupKey> = {
          saddleHeight: "seating", saddleSetback: "seating", barDrop: "cockpit", saddleToBarReach: "cockpit",
          frameStack: "frame", frameReach: "frame",
        };
        for (const output of row.adviceOutput) {
          const outputGroup = calculator === "bike-fit" ? bikeFitGroups[output.key] ?? group : group;
          add(outputGroup, row, output.key, output.value, output.unit, calculatorLink(`/tools/${calculator}`, row.bikeId));
        }
      } else add(group, row, calculator, null, null, calculatorLink(`/tools/${calculator}`, row.bikeId), { saved: true });
    }
  }
  const fallback = sources.profile ? legacyRiderObservations(sources.profile).filter(observation =>
    !sources.observations.some(current => current.status === "current" && !current.bikeId
      && current.field === observation.field && current.value === observation.value)) : [];
  const score = scoreRiderProfile({ profile: sources.profile, observations: [...sources.observations, ...fallback] }, now);
  const relevant: Record<AdviceGroupKey, string[]> = {
    seating: ["inseam", "flexibility", "core"], contact: ["sitBones", "shoulders", "footwear"],
    cockpit: ["torso", "arm", "flexibility"], drivetrain: ["ftp", "weight", "femur"],
    tires: ["weight"], performance: ["ftp", "weight"], frame: ["height", "inseam", "torso"],
  };
  for (const group of groups) {
    group.items.sort((left, right) => left.changeOrder - right.changeOrder || right.date - left.date || left.id.localeCompare(right.id));
    if (group.items.length) group.improvements = score.items.filter(item => relevant[group.key].includes(item.key) && item.gain > 0)
      .sort((left, right) => right.gain - left.gain).slice(0, 3)
      .map(item => ({ key: item.key, field: item.key, gain: item.gain, sourceLink: "/profile" }));
  }
  return groups;
}
