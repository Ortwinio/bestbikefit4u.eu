import { BASE_BIKE_RULES, BASE_RIDER_RULES, BIKE_REFINEMENT_RULES, BIKE_RULES, REFINEMENT_RULES, RIDER_RULES } from "./rules";
import type { BikeValues, ProfileScore, RiderValues, ScoreItem, ScoreLevel, ScoreObservation, ScoreRule } from "./types";

export * from "./types";
export { BASE_BIKE_RULES, BASE_RIDER_RULES, BIKE_REFINEMENT_RULES, BIKE_RULES, REFINEMENT_RULES, RIDER_RULES } from "./rules";

const round = (value: number) => Math.round(value * 10) / 10;

export function profileScoreLevel(completeness: number): ScoreLevel {
  if (completeness >= 90) return "complete";
  if (completeness >= 70) return "strong";
  if (completeness >= 40) return "building";
  return "basic";
}

function readValue(values: object, field: string): unknown {
  return field.split(".").reduce<unknown>((value, key) =>
    value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, values);
}

function present(value: unknown, zeroAllowed = false): boolean {
  if (typeof value === "number") return Number.isFinite(value) && (zeroAllowed || value > 0);
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every(item => present(item));
  return typeof value === "boolean";
}

function quality(observation: ScoreObservation | undefined, rule: ScoreRule, bike: boolean): number {
  let factor: number;
  if (bike) {
    if (observation?.kind === "derived") factor = 0.3;
    else if (observation?.kind === "measured" && observation.measurePoint?.trim()) factor = 1;
    else if (observation?.source === "geometry_database"
      || (observation?.source === "legacy_migration" && observation.method === "geometry_database")) factor = 0.95;
    else if (observation?.method === "component_label") factor = 0.9;
    else if (["strava_import", "listing_import"].includes(observation?.source ?? "")
      || (observation?.source === "legacy_migration"
        && ["strava_import", "listing_import"].includes(observation.method ?? ""))) factor = 0.7;
    else factor = 0.6;
  } else if (observation?.kind === "derived") factor = 0.3;
  else if (observation?.kind === "estimated" || observation?.kind === "declared") factor = 0.6;
  else if (observation?.kind === "measured") {
    if (Number.isInteger(observation.repeatCount) && (observation.repeatCount ?? 0) >= 3
      && observation.withinTolerance === true) factor = 1;
    else if (["fitter", "video"].includes(observation.method ?? "")) factor = 0.95;
    else factor = 0.85;
  } else factor = rule.body ? 0.85 : 0.6;
  return factor * (observation?.unresolvedWarning ? 0.5 : 1);
}

function monthsAgo(now: number, months: number): number {
  const date = new Date(now);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.getTime();
}

function calculate(values: object, observations: readonly ScoreObservation[], rules: readonly ScoreRule[], now: number,
  bike: boolean): ProfileScore {
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) throw new RangeError("Invalid scoring date");
  const current = new Map<string, ScoreObservation>();
  for (const observation of observations) {
    if (observation.status === "superseded" || (!bike && observation.bikeId)) continue;
    if (bike && readValue(values, "_id") && observation.bikeId !== readValue(values, "_id")) continue;
    if (observation.value !== undefined && !sameValue(observation.value, readValue(values, observation.field))) continue;
    const previous = current.get(observation.field);
    if (!previous || (observation.recordedAt ?? 0) > (previous.recordedAt ?? 0)) current.set(observation.field, observation);
  }
  const items: ScoreItem[] = rules.map(rule => {
    const fields = rule.key === "complaints" && readValue(values, "hasPain") === "no" ? ["hasPain"] : rule.fields;
    const complete = fields.every(field => present(readValue(values, field),
      rule.zeroAllowed && field !== "currentSetup.stemLengthMm"));
    const fieldFactors = fields.map(field => {
      const observation = current.get(field);
      const fallbackDate = field === "weightKg" ? readValue(values, "weightUpdatedAt")
        : field === "ftpWatts" ? readValue(values, "ftpMeasuredAt") : undefined;
      const recordedAt = observation?.recordedAt ?? (typeof fallbackDate === "number" ? fallbackDate : undefined);
      const months = bike ? undefined : ["weightKg", "ftpWatts"].includes(field) ? 6
        : field === "flexibilityScore" || (field === "heightCm" && Number(readValue(values, "age")) < 18
          && present(readValue(values, "age"))) ? 12 : undefined;
      const validDate = recordedAt !== undefined && Number.isFinite(recordedAt) && recordedAt >= 0 && recordedAt <= now;
      return {
        quality: quality(observation, rule, bike),
        freshness: months && validDate && recordedAt < monthsAgo(now, months) ? 0.8 : 1,
        missingDate: Boolean(months && !validDate),
      };
    });
    const qualityFactor = complete ? Math.min(...fieldFactors.map(item => item.quality)) : 0;
    const freshness = Math.min(...fieldFactors.map(item => item.freshness));
    const reliability = complete ? rule.weight * qualityFactor * freshness : 0;
    return { key: rule.key, group: rule.group, weight: rule.weight, complete,
      quality: qualityFactor, freshness, completeness: complete ? rule.weight : 0,
      reliability, gain: rule.weight - reliability, missingDate: complete && fieldFactors.some(item => item.missingDate) };
  });
  const groups = [...new Set(rules.map(rule => rule.group))].map(key => {
    const members = items.filter(item => item.group === key);
    return { key, weight: members.reduce((sum, item) => sum + item.weight, 0),
      completeness: members.reduce((sum, item) => sum + item.completeness, 0),
      reliability: round(members.reduce((sum, item) => sum + item.reliability, 0)) };
  });
  const completeness = items.reduce((sum, item) => sum + item.completeness, 0);
  const reliability = round(items.reduce((sum, item) => sum + item.reliability, 0));
  const next = items.filter(item => item.gain > 0 && !rules.find(rule => rule.key === item.key)?.sensitive)
    .sort((first, second) => second.gain - first.gain)[0];
  return { completeness, reliability, level: profileScoreLevel(completeness), groups,
    items: items.map(item => ({ ...item, reliability: round(item.reliability), gain: round(item.gain) })),
    nextStep: next ? { key: next.key, group: next.group, gain: round(next.gain),
      completenessGain: next.complete ? 0 : next.weight } : null };
}

export function scoreRiderProfile(input: { profile: RiderValues | null; observations?: readonly ScoreObservation[] }, now: number,
  access?: { enforced: boolean; fullProfile: boolean }): ProfileScore {
  const rules = access?.enforced ? [...BASE_RIDER_RULES, ...(access.fullProfile ? REFINEMENT_RULES : [])] : RIDER_RULES;
  const score = calculate(input.profile ?? {}, input.observations ?? [], rules, now, false);
  if (!access?.enforced) return score;
  const completeness = round(score.completeness);
  return { ...score, completeness, level: profileScoreLevel(completeness) };
}

export function scoreBike(input: { bike: BikeValues | null; observations?: readonly ScoreObservation[] }, now: number,
  access?: { enforced: boolean; fullReport: boolean }): ProfileScore {
  const measurement = input.bike?.currentSetup?.saddleHeightMeasurement;
  const observations = (input.observations ?? []).map(observation =>
    observation.field === "currentSetup.saddleHeightMm" && measurement
      ? { ...observation, measurePoint: observation.measurePoint ?? measurement.measurePoint }
      : observation);
  if (!access?.enforced) return calculate(input.bike ?? {}, observations, BIKE_RULES, now, true);
  const score = calculate(input.bike ?? {}, observations,
    [...BASE_BIKE_RULES, ...(access.fullReport ? BIKE_REFINEMENT_RULES : [])], now, true);
  const completeness = round(score.completeness);
  return { ...score, completeness, level: profileScoreLevel(completeness) };
}

function sameValue(first: unknown, second: unknown): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return first.length === second.length && first.every((value, index) => value === second[index]);
  }
  return first === second;
}

export type AdviceReliabilityInput = {
  profile?: RiderValues | null;
  bike?: BikeValues | null;
  observations?: readonly ScoreObservation[];
  riderFields: readonly string[];
  bikeFields: readonly string[];
};

export type AdviceReliabilityScore = {
  reliability: number;
  completeness: number;
  items: Array<ScoreItem & { scope: "rider" | "bike"; field: string }>;
  missingFields: Array<{ scope: "rider" | "bike"; field: string }>;
};

export function scoreAdviceReliability(input: AdviceReliabilityInput, now: number): AdviceReliabilityScore {
  const fieldRules = (fields: readonly string[], rules: readonly ScoreRule[]) => [...new Set(fields)].map(field => {
    const rule = rules.find(candidate => candidate.fields.includes(field));
    if (!rule) throw new RangeError(`Unknown advice score field: ${field}`);
    return { ...rule, key: field, fields: [field], weight: rule.weight / rule.fields.length };
  });
  const riderRules = fieldRules(input.riderFields, RIDER_RULES);
  const bikeRules = fieldRules(input.bikeFields, BIKE_RULES);
  const total = [...riderRules, ...bikeRules].reduce((sum, rule) => sum + rule.weight, 0);
  const normalize = (rules: ScoreRule[]) => rules.map(rule => ({ ...rule, weight: rule.weight / total * 100 }));
  const observations = input.observations ?? [];
  const measurement = input.bike?.currentSetup?.saddleHeightMeasurement;
  const bikeObservations = observations.map(observation =>
    observation.field === "currentSetup.saddleHeightMm" && measurement
      ? { ...observation, measurePoint: observation.measurePoint ?? measurement.measurePoint } : observation);
  const rider = calculate(input.profile ?? {}, observations, normalize(riderRules), now, false);
  const bike = calculate(input.bike ?? {}, bikeObservations, normalize(bikeRules), now, true);
  const items = [
    ...rider.items.map(item => ({ ...item, scope: "rider" as const, field: item.key })),
    ...bike.items.map(item => ({ ...item, scope: "bike" as const, field: item.key })),
  ];
  return {
    reliability: round(items.reduce((sum, item) => sum + item.weight * item.quality * item.freshness, 0)),
    completeness: round(items.reduce((sum, item) => sum + item.completeness, 0)),
    items,
    missingFields: items.filter(item => !item.complete).map(({ scope, field }) => ({ scope, field })),
  };
}
