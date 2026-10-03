import type { Doc } from "../convex/_generated/dataModel";
import { bikeEditRanges } from "./bikeEditValidation";
import { PROFILE_OBSERVATION_FIELDS, validateProfileObservationValue } from "./profileObservationFields";
import { BIKE_RULES, RIDER_RULES, scoreBike, scoreRiderProfile } from "./profileScore";
import type { ProfileScore, ScoreObservation, ScoreRule } from "./profileScore";

export type PromptCandidate = {
  key: string;
  field: string;
  bikeId?: Doc<"bikes">["_id"];
  bikeName?: string;
  value: number | string | null;
  unit: string;
  kind: "measured" | "estimated" | "declared";
  range?: readonly [number, number];
  options?: readonly string[];
  effects: string[];
  gain: number;
  completenessGain: number;
  effort: "quick" | "measure";
  stale: boolean;
};

export type PromptObservation = Omit<ScoreObservation, "value"> & {
  value?: number | string | readonly string[] | readonly number[];
};

export type ProfilePromptInput = {
  profile: Doc<"profiles"> | null;
  observations: readonly PromptObservation[];
  bikes: readonly Doc<"bikes">[];
  bikeObservations: readonly PromptObservation[];
  recentCalculators: readonly string[];
  history: readonly { key: string; skipCount: number; skippedUntil?: number; profileOnly?: boolean }[];
  now: number;
};

export type PromptFieldSpec = Pick<PromptCandidate, "unit" | "kind" | "range" | "options" | "effort"> & {
  effects: readonly string[];
  remeasure: boolean;
};

function riderSpec(field: string, effort: PromptCandidate["effort"], effects: string[], remeasure = false): PromptFieldSpec {
  const definition = PROFILE_OBSERVATION_FIELDS[field];
  if (!definition || definition.kind === "derived") throw new Error("Invalid prompt field definition");
  return { unit: definition.unit, kind: definition.kind, range: definition.range,
    options: definition.options, effort, effects, remeasure };
}

export const RIDER_PROMPT_FIELDS: Readonly<Record<string, PromptFieldSpec>> = {
  heightCm: riderSpec("heightCm", "measure", ["bike-fit", "frame-size"], true),
  inseamCm: riderSpec("inseamCm", "measure", ["saddle-height", "bike-fit", "frame-size", "crank-length"], true),
  torsoLengthCm: riderSpec("torsoLengthCm", "measure", ["bike-fit", "frame-size"], true),
  armLengthCm: riderSpec("armLengthCm", "measure", ["bike-fit", "frame-size"], true),
  shoulderWidthCm: riderSpec("shoulderWidthCm", "measure", ["bike-fit"], true),
  femurLengthCm: riderSpec("femurLengthCm", "measure", ["bike-fit", "crank-length"], true),
  sitBoneWidthMm: riderSpec("sitBoneWidthMm", "measure", ["saddle-width"], true),
  weightKg: riderSpec("weightKg", "quick", ["tire-pressure", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"], true),
  flexibilityScore: riderSpec("flexibilityScore", "quick", ["bike-fit", "saddle-width"]),
  coreStabilityScore: riderSpec("coreStabilityScore", "quick", ["bike-fit"]),
  ftpWatts: riderSpec("ftpWatts", "quick", ["ftp-wkg", "power-speed", "climb-planner", "gearing", "fuel-hydration"]),
  experienceLevel: riderSpec("experienceLevel", "quick", ["bike-fit"]),
  weeklyHours: riderSpec("weeklyHours", "quick", ["bike-fit", "fuel-hydration"]),
  typicalRideLength: riderSpec("typicalRideLength", "quick", ["bike-fit", "fuel-hydration"]),
  positionPriority: riderSpec("positionPriority", "quick", ["bike-fit", "saddle-width"]),
  shoeSizeEu: riderSpec("shoeSizeEu", "quick", ["bike-fit"]),
  cleatSystem: riderSpec("cleatSystem", "quick", ["bike-fit"]),
  sex: riderSpec("sex", "quick", ["bike-fit", "ftp-wkg", "power-speed", "climb-planner"]),
  birthDate: riderSpec("birthDate", "quick", ["bike-fit", "ftp-wkg", "power-speed", "climb-planner"]),
};

export const BIKE_PROMPT_FIELDS: Readonly<Record<string, PromptFieldSpec>> = {
  bikeType: { unit: "none", kind: "declared", options: ["road", "gravel", "mountain", "hybrid", "tt_triathlon", "cyclocross", "touring", "city"],
    effort: "quick", effects: ["bike-fit", "saddle-height", "tire-pressure", "gearing"], remeasure: true },
  "currentSetup.saddleHeightMm": { unit: "mm", kind: "measured", range: bikeEditRanges.currentSetup.saddleHeightMm,
    effort: "measure", effects: ["saddle-height", "bike-fit"], remeasure: true },
  "currentSetup.crankLengthMm": { unit: "mm", kind: "measured", range: bikeEditRanges.currentSetup.crankLengthMm,
    effort: "quick", effects: ["crank-length", "gearing", "bike-fit"], remeasure: true },
};

export function getPromptDefinition(field: string, bike: boolean): PromptFieldSpec | undefined {
  const registry = bike ? BIKE_PROMPT_FIELDS : RIDER_PROMPT_FIELDS;
  return Object.hasOwn(registry, field) ? registry[field] : undefined;
}

export function validatePromptValue(field: string, value: unknown, bike = false): number | string {
  const registry = bike ? BIKE_PROMPT_FIELDS : RIDER_PROMPT_FIELDS;
  if (!Object.hasOwn(registry, field)) throw new Error("Invalid prompt field");
  if (!bike) {
    const valid = validateProfileObservationValue(field, value);
    if (typeof valid !== "string" && typeof valid !== "number") throw new Error("Invalid prompt value");
    return valid;
  }
  const spec = registry[field];
  if (spec.range) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < spec.range[0] || value > spec.range[1]) {
      throw new Error("Invalid prompt value");
    }
    return value;
  }
  if (typeof value !== "string" || !spec.options?.includes(value)) throw new Error("Invalid prompt value");
  return value;
}

function read(values: object | null, field: string): unknown {
  return field.split(".").reduce<unknown>((value, key) => value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)[key] : undefined, values);
}

function valueFor(values: object | null, field: string): number | string | null {
  const value = read(values, field);
  return typeof value === "number" && Number.isFinite(value) && value > 0
    || typeof value === "string" && value.trim() ? value as number | string : null;
}

function matchingObservations(values: object | null, observations: readonly PromptObservation[], bikeId?: string): ScoreObservation[] {
  return observations.filter(observation => {
    if (observation.status === "superseded" || observation.bikeId !== bikeId) return false;
    const value = read(values, observation.field);
    return observation.value === undefined || (Array.isArray(observation.value) && Array.isArray(value)
      ? observation.value.length === value.length && observation.value.every((entry, index) => entry === value[index])
      : observation.value === value);
  }).map(observation => ({ ...observation,
    value: typeof observation.value === "number" || typeof observation.value === "string" ? observation.value : undefined,
  }));
}

function currentObservation(observations: readonly ScoreObservation[], field: string): ScoreObservation | undefined {
  return observations.filter(observation => observation.field === field).reduce<ScoreObservation | undefined>(
    (latest, observation) => !latest || (observation.recordedAt ?? -1) > (latest.recordedAt ?? -1) ? observation : latest, undefined,
  );
}

function isEstimateInput(field: string): boolean {
  return field === "sex" || field === "birthDate";
}

function needsEstimateInput(values: object | null, field: string): boolean {
  return valueFor(values, "flexibilityScore") === null
    || (valueFor(values, "ftpWatts") === null
      && (field !== "birthDate" || valueFor(values, "sex") !== "prefer_not_to_say"));
}

function candidatesFor(values: object | null, specs: Readonly<Record<string, PromptFieldSpec>>, rules: readonly ScoreRule[],
  score: ProfileScore, observations: readonly ScoreObservation[], staleOnly: boolean, bike?: Doc<"bikes">,
  includeCompleted = false): PromptCandidate[] {
  const candidates: PromptCandidate[] = [];
  for (const [field, spec] of Object.entries(specs)) {
    const value = valueFor(values, field);
    if (!bike && isEstimateInput(field)) {
      if (!includeCompleted && (staleOnly || value !== null || !needsEstimateInput(values, field))) continue;
      candidates.push({ key: `rider:${field}`, field, value, unit: spec.unit, kind: spec.kind,
        ...(spec.options ? { options: spec.options } : {}), effects: [...spec.effects],
        gain: 0, completenessGain: 0, effort: spec.effort, stale: false });
      continue;
    }
    const rule = rules.find(entry => entry.fields.includes(field));
    const item = score.items.find(entry => entry.key === rule?.key);
    if (!rule || !item || rule.sensitive) continue;
    const stale = !bike && value !== null && ["weightKg", "ftpWatts", "flexibilityScore"].includes(field)
      && item.freshness < 1 && !item.missingDate;
    if (!includeCompleted && staleOnly && !stale) continue;
    const observation = currentObservation(observations, field);
    const canImprove = spec.remeasure && (observation?.kind === "estimated" || observation?.kind === "derived");
    const needsBikeType = field === "bikeType" && bike?.needsTypeConfirmation === true && observation?.kind !== "measured";
    if (!includeCompleted && value !== null && !stale && !canImprove && !needsBikeType) continue;
    const missingFields = rule.fields.filter(member => valueFor(values, member) === null);
    candidates.push({ key: bike ? `bike:${bike._id}:${field}` : `rider:${field}`, field,
      ...(bike ? { bikeId: bike._id, bikeName: bike.name } : {}), value, unit: spec.unit, kind: spec.kind,
      ...(spec.range ? { range: spec.range } : {}), ...(spec.options ? { options: spec.options } : {}),
      effects: [...spec.effects], gain: Math.round(item.gain / rule.fields.length * 100) / 100,
      completenessGain: value === null && missingFields.length === 1 ? rule.weight : 0,
      effort: spec.effort, stale });
  }
  return candidates;
}

export function buildPromptCandidates(input: ProfilePromptInput): PromptCandidate[] {
  const observations = matchingObservations(input.profile, input.observations);
  const score = scoreRiderProfile({ profile: input.profile, observations }, input.now);
  const staleOnly = score.completeness > 90;
  const candidates = candidatesFor(input.profile, RIDER_PROMPT_FIELDS, RIDER_RULES, score, observations, staleOnly);
  for (const bike of input.bikes) {
    const bikeObservations = matchingObservations(bike, input.bikeObservations, bike._id);
    const bikeScore = scoreBike({ bike, observations: bikeObservations }, input.now);
    candidates.push(...candidatesFor(bike, BIKE_PROMPT_FIELDS, BIKE_RULES, bikeScore,
      bikeObservations, staleOnly || bikeScore.completeness > 90, bike));
  }
  const recent = new Set(input.recentCalculators);
  const weightedGain = (candidate: PromptCandidate) => candidate.gain * (candidate.effects.some(effect => recent.has(effect)) ? 1.5 : 1);
  const eligible = candidates.filter(candidate => !input.history.some(entry => entry.key === candidate.key
    && (entry.profileOnly || entry.skipCount >= 3 || (entry.skippedUntil !== undefined && entry.skippedUntil > input.now))));
  eligible.sort((first, second) => Number(isEstimateInput(first.field)) - Number(isEstimateInput(second.field))
    || Number(first.effort === "measure") - Number(second.effort === "measure")
    || weightedGain(second) - weightedGain(first) || (first.key < second.key ? -1 : first.key > second.key ? 1 : 0));
  return eligible;
}

export const eligibleProfilePrompts = buildPromptCandidates;

export function selectProfilePrompts(input: ProfilePromptInput): PromptCandidate[] {
  const selected: PromptCandidate[] = [];
  for (const candidate of eligibleProfilePrompts(input)) {
    if (selected.some(entry => entry.key === candidate.key || (entry.effort === "measure" && candidate.effort === "measure"))) continue;
    selected.push(candidate);
    if (selected.length === 2) break;
  }
  return selected;
}

export function planProfilePrompts(input: ProfilePromptInput): PromptCandidate[] {
  return selectProfilePrompts(input);
}

export function describeProfilePrompt(input: ProfilePromptInput, target: { field: string; bikeId?: string }): PromptCandidate | null {
  if (target.bikeId !== undefined) {
    const bike = input.bikes.find(entry => entry._id === target.bikeId);
    if (!bike || !getPromptDefinition(target.field, true)) return null;
    const observations = matchingObservations(bike, input.bikeObservations, bike._id);
    return candidatesFor(bike, BIKE_PROMPT_FIELDS, BIKE_RULES, scoreBike({ bike, observations }, input.now),
      observations, false, bike, true).find(candidate => candidate.field === target.field) ?? null;
  }
  if (!getPromptDefinition(target.field, false)) return null;
  const observations = matchingObservations(input.profile, input.observations);
  return candidatesFor(input.profile, RIDER_PROMPT_FIELDS, RIDER_RULES,
    scoreRiderProfile({ profile: input.profile, observations }, input.now), observations, false, undefined, true)
    .find(candidate => candidate.field === target.field) ?? null;
}
