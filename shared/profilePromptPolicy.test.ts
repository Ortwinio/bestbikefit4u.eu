import { describe, expect, it, vi } from "vitest";
import type { Doc } from "../convex/_generated/dataModel";
import { legacyRiderObservations } from "./profileObservationMigration";
import { scoreRiderProfile } from "./profileScore";
import {
  BIKE_PROMPT_FIELDS, RIDER_PROMPT_FIELDS, buildPromptCandidates, describeProfilePrompt, eligibleProfilePrompts, getPromptDefinition,
  planProfilePrompts, selectProfilePrompts, validatePromptValue,
  type ProfilePromptInput,
} from "./profilePromptPolicy";

const now = Date.UTC(2026, 9, 3, 12);
const completeProfile = {
  _id: "profile", _creationTime: 100, userId: "user", updatedAt: 100,
  heightCm: 178, inseamCm: 83, torsoLengthCm: 60, armLengthCm: 65, shoulderWidthCm: 40,
  femurLengthCm: 45, sitBoneWidthMm: 120, weightKg: 75, ftpWatts: 240,
  flexibilityScore: "good", coreStabilityScore: 4, experienceLevel: "intermediate",
  weeklyHours: "3-6", typicalRideLength: "medium", hasPain: "no", positionPriority: "balanced",
  shoeSizeEu: 43, cleatSystem: "spd",
} as Doc<"profiles">;
const bike = { _id: "bike-one", _creationTime: 100, userId: "user", name: "Actual bike", bikeType: "road",
  createdAt: 100, updatedAt: 100 } as Doc<"bikes">;

function input(overrides: Partial<ProfilePromptInput> = {}): ProfilePromptInput {
  return { profile: null, observations: [], bikes: [], bikeObservations: [], recentCalculators: [], history: [], now, ...overrides };
}

describe("profile prompt selection", () => {
  it("exposes all eligible slots and revalidates pending slots after completion or a third skip", () => {
    const state = input();
    expect(eligibleProfilePrompts(state)).toEqual(buildPromptCandidates(state));
    expect(eligibleProfilePrompts(state).length).toBeGreaterThan(2);
    expect(eligibleProfilePrompts(state).filter(candidate => candidate.effort === "measure").length).toBeGreaterThan(1);
    const reserved = "rider:heightCm";
    const beforeAnswer = input({ profile: { ...completeProfile, heightCm: undefined, femurLengthCm: undefined } });
    expect(eligibleProfilePrompts(beforeAnswer).some(candidate => candidate.key === reserved)).toBe(true);
    expect(eligibleProfilePrompts(beforeAnswer).some(candidate => candidate.key === "rider:femurLengthCm")).toBe(true);
    const afterAnswer = { ...beforeAnswer, profile: { ...completeProfile, heightCm: undefined } };
    expect(eligibleProfilePrompts(afterAnswer).some(candidate => candidate.key === reserved)).toBe(true);
    const above90 = { ...beforeAnswer, profile: { ...completeProfile, femurLengthCm: undefined } };
    expect(eligibleProfilePrompts(above90)).toEqual([]);
    const thirdSkip = { ...state, history: [{ key: reserved, skipCount: 3 }] };
    expect(eligibleProfilePrompts(thirdSkip).some(candidate => candidate.key === reserved)).toBe(false);
    expect(describeProfilePrompt(thirdSkip, { field: "heightCm" })).not.toBeNull();
  });
  it("returns all eligible definitions separately from a capped selection without defaults", () => {
    const state = input();
    const all = buildPromptCandidates(state);
    expect(all.length).toBe(Object.keys(RIDER_PROMPT_FIELDS).length);
    expect(all.every(candidate => candidate.value === null && candidate.key === `rider:${candidate.field}`)).toBe(true);
    expect(selectProfilePrompts(state).map(candidate => candidate.field)).toEqual(["flexibilityScore", "weightKg"]);
    expect(planProfilePrompts(state)).toEqual(selectProfilePrompts(state));
    expect(selectProfilePrompts(state)).toHaveLength(2);
  });

  it("always places quick answers before tape measurements even when measurements have higher gain", () => {
    const all = buildPromptCandidates(input()).filter(candidate => !["sex", "birthDate"].includes(candidate.field));
    expect(all.find(candidate => candidate.field === "inseamCm")?.gain).toBe(20);
    const firstMeasure = all.findIndex(candidate => candidate.effort === "measure");
    expect(all.slice(firstMeasure).every(candidate => candidate.effort === "measure")).toBe(true);
    expect(all[0].gain).toBeLessThan(20);
  });

  it("selects at most one measurement, without filling the second slot with another", () => {
    const history = Object.entries(RIDER_PROMPT_FIELDS).filter(([, spec]) => spec.effort === "quick")
      .map(([field]) => ({ key: `rider:${field}`, skipCount: 3 }));
    expect(selectProfilePrompts(input({ history })).map(candidate => candidate.field)).toEqual(["inseamCm"]);
    const withoutWeight = history.filter(entry => entry.key !== "rider:weightKg");
    expect(selectProfilePrompts(input({ history: withoutWeight })).map(candidate => candidate.field)).toEqual(["weightKg", "inseamCm"]);
  });

  it("applies the recent relevance bonus once, without changing the displayed gain", () => {
    const state = input({ recentCalculators: ["gearing", "gearing"] });
    const selected = selectProfilePrompts(state);
    expect(selected.map(candidate => candidate.field)).toEqual(["flexibilityScore", "ftpWatts"]);
    expect(selected[1].gain).toBe(5);
    expect(selected[1].effects).toContain("gearing");
  });

  it("is deterministic across input bike order and does not mutate its input", () => {
    const state = input({ bikes: [bike, { ...bike, _id: "bike-two" as Doc<"bikes">["_id"] }] });
    const before = structuredClone(state);
    expect(buildPromptCandidates(state)).toEqual(buildPromptCandidates({ ...state, bikes: [...state.bikes].reverse() }));
    expect(state).toEqual(before);
  });

  it("excludes sensitive fields in planning and independent definition/validation lookups", () => {
    for (const field of ["hasPain", "painAreas", "painSeverity", "kneePainTiming", "age", "injuryHistory", "sweatProfile", "constructor", "__proto__"]) {
      expect(getPromptDefinition(field, false)).toBeUndefined();
      expect(buildPromptCandidates(input()).some(candidate => candidate.field === field)).toBe(false);
      expect(() => validatePromptValue(field, "yes")).toThrow("Invalid prompt field");
    }
  });

  it("honors per-key skips, profile-only status, and exact expiry boundaries", () => {
    const state = input({ history: [
      { key: "rider:flexibilityScore", skipCount: 0, skippedUntil: now + 1 },
      { key: "rider:weightKg", skipCount: 3, skippedUntil: now - 1 },
      { key: "rider:ftpWatts", skipCount: 0, profileOnly: true },
      { key: "rider:coreStabilityScore", skipCount: 2, skippedUntil: now },
    ] });
    const keys = buildPromptCandidates(state).map(candidate => candidate.key);
    expect(keys).not.toContain("rider:flexibilityScore");
    expect(keys).not.toContain("rider:weightKg");
    expect(keys).not.toContain("rider:ftpWatts");
    expect(keys).toContain("rider:coreStabilityScore");
  });

  it("never reasks answered measured or declared values solely for higher score quality", () => {
    const profile = { ...completeProfile, femurLengthCm: undefined, sitBoneWidthMm: undefined, shoeSizeEu: undefined };
    const state = input({ profile, observations: [
      { field: "inseamCm", value: 83, kind: "measured", recordedAt: 100 },
      { field: "weightKg", value: 75, kind: "measured", recordedAt: now },
      { field: "positionPriority", value: "balanced", kind: "declared" },
      { field: "coreStabilityScore", value: 4, kind: "estimated" },
    ] });
    const fields = buildPromptCandidates(state).map(candidate => candidate.field);
    expect(fields).not.toContain("inseamCm");
    expect(fields).not.toContain("weightKg");
    expect(fields).not.toContain("positionPriority");
    expect(fields).not.toContain("coreStabilityScore");
  });

  it("uses supplied conservative legacy provenance to ask for measurement of derived body values", () => {
    const profile = { ...completeProfile, armLengthCm: 178 * .44, torsoLengthCm: 178 * .32,
      femurLengthCm: undefined, sitBoneWidthMm: undefined, shoeSizeEu: undefined };
    const candidates = buildPromptCandidates(input({ profile, observations: legacyRiderObservations(profile) }));
    expect(candidates).toContainEqual(expect.objectContaining({ field: "armLengthCm", value: 178 * .44, kind: "measured", effort: "measure", completenessGain: 0, gain: 5.6 }));
    expect(buildPromptCandidates(input({ profile })).some(candidate => candidate.field === "armLengthCm")).toBe(false);
  });

  it("ignores mismatched, superseded and wrong-scope provenance", () => {
    const profile = { ...completeProfile, femurLengthCm: undefined, sitBoneWidthMm: undefined, shoeSizeEu: undefined };
    const candidates = buildPromptCandidates(input({ profile, observations: [
      { field: "inseamCm", value: 99, kind: "derived" },
      { field: "armLengthCm", value: 65, kind: "derived", status: "superseded" },
      { field: "torsoLengthCm", value: 60, kind: "derived", bikeId: "bike-one" },
    ] }));
    expect(candidates.some(candidate => ["inseamCm", "armLengthCm", "torsoLengthCm"].includes(candidate.field))).toBe(false);
  });

  it("uses latest matching current provenance", () => {
    const profile = { ...completeProfile, femurLengthCm: undefined, sitBoneWidthMm: undefined, shoeSizeEu: undefined };
    const candidates = buildPromptCandidates(input({ profile, observations: [
      { field: "inseamCm", value: 83, kind: "derived", recordedAt: 100 },
      { field: "inseamCm", value: 83, kind: "measured", recordedAt: 200 },
    ] }));
    expect(candidates.some(candidate => candidate.field === "inseamCm")).toBe(false);
  });

  it("offers only genuinely stale confirmations above 90 percent, suppressing missing bike fields too", () => {
    const profile = { ...completeProfile, femurLengthCm: undefined };
    expect(scoreRiderProfile({ profile }, now).completeness).toBe(97);
    expect(buildPromptCandidates(input({ profile, bikes: [bike] }))).toEqual([]);
    const candidates = buildPromptCandidates(input({ profile, bikes: [bike], observations: [
      { field: "weightKg", value: 75, kind: "measured", recordedAt: Date.UTC(2025, 0, 1) },
    ] }));
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ field: "weightKg", value: 75, stale: true, completenessGain: 0 });
  });

  it("keeps exactly 90 percent eligible for missing non-stale data", () => {
    const profile = { ...completeProfile, heightCm: undefined };
    expect(scoreRiderProfile({ profile }, now).completeness).toBe(90);
    expect(buildPromptCandidates(input({ profile })).map(candidate => candidate.field)).toEqual(["heightCm"]);
  });

  it.each([
    ["weightKg", 75, 6], ["ftpWatts", 240, 6], ["flexibilityScore", "good", 12],
  ] as const)("uses the exact calendar freshness boundary for %s", (field, value, months) => {
    const boundary = Date.UTC(2026, 9 - months, 3, 12);
    const state = input({ profile: completeProfile, observations: [{ field, value, kind: "measured", recordedAt: boundary }] });
    expect(buildPromptCandidates(state)).toEqual([]);
    const candidates = buildPromptCandidates({ ...state, observations: [{ field, value, kind: "measured", recordedAt: boundary - 1 }] });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ field, value, stale: true });
  });

  it("handles calendar month ends through the shared score freshness rules", () => {
    const monthEnd = Date.UTC(2026, 2, 31, 12);
    const boundary = Date.UTC(2025, 8, 30, 12);
    const state = input({ profile: completeProfile, now: monthEnd, observations: [
      { field: "weightKg", value: 75, kind: "measured", recordedAt: boundary },
    ] });
    expect(buildPromptCandidates(state)).toEqual([]);
    expect(buildPromptCandidates({ ...state, observations: [{ ...state.observations[0], recordedAt: boundary - 1 }] })[0].stale).toBe(true);
  });

  it.each([undefined, Number.NaN, -1, now + 1])("does not invent stale dates for recordedAt=%s", recordedAt => {
    expect(buildPromptCandidates(input({ profile: completeProfile, observations: [
      { field: "weightKg", value: 75, kind: "measured", recordedAt },
      { field: "ftpWatts", value: 240, kind: "measured", recordedAt },
      { field: "flexibilityScore", value: "good", kind: "estimated", recordedAt },
    ] }))).toEqual([]);
  });

  it("uses actual weight/FTP timestamps but not generic updatedAt as freshness evidence", () => {
    expect(buildPromptCandidates(input({ profile: completeProfile }))).toEqual([]);
    const candidates = buildPromptCandidates(input({ profile: { ...completeProfile, weightUpdatedAt: 100, ftpMeasuredAt: 100 } }));
    expect(candidates.map(candidate => candidate.field).sort()).toEqual(["ftpWatts", "weightKg"]);
    expect(candidates.every(candidate => candidate.stale)).toBe(true);
  });

  it("exposes only actual bike fields and requires exact observation ownership scope", () => {
    expect(buildPromptCandidates(input()).some(candidate => candidate.bikeId)).toBe(false);
    const state = input({ bikes: [{ ...bike, currentSetup: { saddleHeightMm: 720, crankLengthMm: 172.5 } }],
      bikeObservations: [
        { field: "bikeType", value: "road", kind: "derived", bikeId: "other-bike" },
        { field: "currentSetup.saddleHeightMm", value: 720, kind: "estimated" },
        { field: "currentSetup.crankLengthMm", value: 172.5, kind: "estimated", bikeId: bike._id },
      ] });
    const candidates = buildPromptCandidates(state).filter(candidate => candidate.bikeId);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ key: "bike:bike-one:currentSetup.crankLengthMm", field: "currentSetup.crankLengthMm",
      bikeId: bike._id, bikeName: "Actual bike", value: 172.5, range: [120, 220], kind: "measured" });
    expect(Object.keys(BIKE_PROMPT_FIELDS)).toEqual(["bikeType", "currentSetup.saddleHeightMm", "currentSetup.crankLengthMm"]);
  });

  it("supports missing setup and type confirmation without repeating an established bike type", () => {
    const candidates = buildPromptCandidates(input({ bikes: [{ ...bike, needsTypeConfirmation: true }] }));
    expect(candidates.filter(candidate => candidate.bikeId).map(candidate => candidate.field).sort())
      .toEqual(["bikeType", "currentSetup.crankLengthMm", "currentSetup.saddleHeightMm"]);
    expect(buildPromptCandidates(input({ bikes: [bike] })).some(candidate => candidate.bikeId && candidate.field === "bikeType")).toBe(false);
  });

  it("does not apply one bike's skip to another bike", () => {
    const candidates = buildPromptCandidates(input({ bikes: [bike, { ...bike, _id: "bike-two" as Doc<"bikes">["_id"] }],
      history: [{ key: "bike:bike-one:currentSetup.crankLengthMm", skipCount: 3 }] }));
    expect(candidates.some(candidate => candidate.key === "bike:bike-one:currentSetup.crankLengthMm")).toBe(false);
    expect(candidates.some(candidate => candidate.key === "bike:bike-two:currentSetup.crankLengthMm")).toBe(true);
  });

  it("only promises completeness gain when this answer can complete its compound group", () => {
    expect(buildPromptCandidates(input()).find(candidate => candidate.field === "experienceLevel"))
      .toMatchObject({ gain: 2, completenessGain: 0 });
    const profile = { ...completeProfile, experienceLevel: undefined, sitBoneWidthMm: undefined };
    expect(buildPromptCandidates(input({ profile })).find(candidate => candidate.field === "experienceLevel"))
      .toMatchObject({ completenessGain: 6 });
  });

  it("rehydrates definitions independently of completion/eligibility", () => {
    expect(buildPromptCandidates(input({ profile: completeProfile }))).toEqual([]);
    expect(getPromptDefinition("inseamCm", false)).toMatchObject({ unit: "cm", kind: "measured", range: [50, 120], effort: "measure" });
    expect(getPromptDefinition("currentSetup.saddleHeightMm", true)).toMatchObject({ unit: "mm", range: [400, 1000] });
    expect(getPromptDefinition("currentSetup.saddleHeightMm", false)).toBeUndefined();
  });

  it("rehydrates reserved fields from current values despite completion, skips and changed eligibility", () => {
    const state = input({ profile: { ...completeProfile, inseamCm: 84 }, bikes: [bike],
      history: [{ key: "rider:inseamCm", skipCount: 3, profileOnly: true, skippedUntil: now + 1 }] });
    expect(planProfilePrompts(state)).toEqual([]);
    expect(describeProfilePrompt(state, { field: "inseamCm" })).toMatchObject({
      key: "rider:inseamCm", value: 84, completenessGain: 0, stale: false,
    });
    expect(describeProfilePrompt(state, { field: "currentSetup.saddleHeightMm", bikeId: bike._id }))
      .toMatchObject({ key: "bike:bike-one:currentSetup.saddleHeightMm", value: null });
    expect(describeProfilePrompt(state, { field: "currentSetup.saddleHeightMm", bikeId: "deleted-bike" })).toBeNull();
    expect(describeProfilePrompt(state, { field: "currentSetup.saddleHeightMm", bikeId: "" })).toBeNull();
    expect(describeProfilePrompt(state, { field: "painAreas" })).toBeNull();
    expect(describeProfilePrompt(state, { field: "inseamCm", bikeId: bike._id })).toBeNull();
  });

  it("validates answer fields, types, enums and actual bike/profile bounds without coercion", () => {
    expect(validatePromptValue("inseamCm", 81)).toBe(81);
    expect(validatePromptValue("coreStabilityScore", 4)).toBe(4);
    expect(validatePromptValue("bikeType", "mountain", true)).toBe("mountain");
    expect(validatePromptValue("currentSetup.crankLengthMm", 172.5, true)).toBe(172.5);
    expect(validatePromptValue("currentSetup.saddleHeightMm", 400, true)).toBe(400);
    for (const value of [399, 1001, NaN, Infinity, "720", null]) {
      expect(() => validatePromptValue("currentSetup.saddleHeightMm", value, true)).toThrow();
    }
    expect(() => validatePromptValue("bikeType", "mtb", true)).toThrow();
    expect(() => validatePromptValue("flexibilityScore", "unknown")).toThrow();
    expect(() => validatePromptValue("coreStabilityScore", 2.5)).toThrow();
    expect(() => validatePromptValue("cleatSystem", " ")).toThrow();
    expect(() => validatePromptValue("shoeSizeEu", 999)).toThrow();
  });
});

describe("optional R13 estimate input prompts", () => {
  function demographics(state: ProfilePromptInput) {
    return eligibleProfilePrompts(state).filter(candidate => ["sex", "birthDate"].includes(candidate.field));
  }

  it("offers missing declared inputs without inventing gains, values or score weights", () => {
    const candidates = demographics(input());
    expect(candidates.map(candidate => candidate.field)).toEqual(["birthDate", "sex"]);
    expect(candidates.every(candidate => candidate.value === null && candidate.kind === "declared"
      && candidate.gain === 0 && candidate.completenessGain === 0 && !candidate.stale && candidate.effort === "quick")).toBe(true);
    expect(getPromptDefinition("sex", false)).toMatchObject({ unit: "none", options: ["female", "male", "prefer_not_to_say"] });
    expect(getPromptDefinition("birthDate", false)).toMatchObject({ unit: "date", kind: "declared" });
    const profile = { ...completeProfile, ftpWatts: undefined, flexibilityScore: undefined };
    const withDemographics = { ...profile, sex: "female", birthDate: "1990-01-01" };
    expect(scoreRiderProfile({ profile }, now)).toEqual(scoreRiderProfile({ profile: withDemographics }, now));
  });

  it.each([
    [undefined, "good", ["birthDate", "sex"]],
    [240, undefined, ["birthDate", "sex"]],
    [240, "good", []],
  ] as const)("requires a missing FTP or flexibility target (%s, %s)", (ftpWatts, flexibilityScore, expected) => {
    const profile = { ...completeProfile, heightCm: undefined, ftpWatts, flexibilityScore };
    expect(demographics(input({ profile })).map(candidate => candidate.field)).toEqual(expected);
  });

  it.each(["female", "male", "prefer_not_to_say"] as const)("does not repeatedly ask answered sex %s", sex => {
    const profile = { ...completeProfile, ftpWatts: undefined, flexibilityScore: undefined, sex };
    expect(demographics(input({ profile })).map(candidate => candidate.field)).toEqual(["birthDate"]);
  });

  it("does not request birth date solely for FTP after sex was declined", () => {
    const profile = { ...completeProfile, heightCm: undefined, ftpWatts: undefined, sex: "prefer_not_to_say" as const };
    expect(demographics(input({ profile }))).toEqual([]);
    expect(demographics(input({ profile: { ...profile, flexibilityScore: undefined } })))
      .toEqual([expect.objectContaining({ field: "birthDate" })]);
  });

  it("never derives birth date from legacy age or guesses missing sex", () => {
    const profile = { ...completeProfile, ftpWatts: undefined, flexibilityScore: undefined, age: 36 };
    expect(demographics(input({ profile })).every(candidate => candidate.value === null)).toBe(true);
    expect(getPromptDefinition("age", false)).toBeUndefined();
    expect(describeProfilePrompt(input({ profile }), { field: "age" })).toBeNull();
  });

  it("prioritizes every scored question, including measurements, over zero-gain estimate inputs", () => {
    const state = input({ recentCalculators: ["ftp-wkg", "bike-fit"] });
    const all = eligibleProfilePrompts(state);
    expect(all.slice(-2).map(candidate => candidate.field)).toEqual(["birthDate", "sex"]);
    const history = Object.keys(RIDER_PROMPT_FIELDS).filter(field => !["sex", "birthDate", "inseamCm"].includes(field))
      .map(field => ({ key: `rider:${field}`, skipCount: 3 }));
    expect(planProfilePrompts({ ...state, history }).map(candidate => candidate.field)).toEqual(["inseamCm", "birthDate"]);
    expect(demographics(state).every(candidate => candidate.gain === 0)).toBe(true);
  });

  it("retains two-slot limits and per-field skip policies for zero-gain prompts", () => {
    const history = Object.keys(RIDER_PROMPT_FIELDS).filter(field => !["sex", "birthDate"].includes(field))
      .map(field => ({ key: `rider:${field}`, skipCount: 3 }));
    expect(planProfilePrompts(input({ history })).map(candidate => candidate.field)).toEqual(["birthDate", "sex"]);
    for (const skip of [{ skipCount: 3 }, { skipCount: 0, profileOnly: true }, { skipCount: 1, skippedUntil: now + 1 }]) {
      expect(planProfilePrompts(input({ history: [...history, { key: "rider:birthDate", ...skip }] }))
        .map(candidate => candidate.field)).toEqual(["sex"]);
    }
    expect(planProfilePrompts(input({ history: [...history, { key: "rider:sex", skipCount: 2, skippedUntil: now }] })))
      .toHaveLength(2);
  });

  it("suppresses demographics above 90 even with a missing FTP and a genuinely stale confirmation", () => {
    const profile = { ...completeProfile, ftpWatts: undefined };
    expect(scoreRiderProfile({ profile }, now).completeness).toBeGreaterThan(90);
    const state = input({ profile, observations: [{ field: "weightKg", value: 75, kind: "measured", recordedAt: 100 }] });
    expect(demographics(state)).toEqual([]);
    expect(eligibleProfilePrompts(state)).toEqual([expect.objectContaining({ field: "weightKg", stale: true })]);
    expect(describeProfilePrompt(state, { field: "birthDate" })).toMatchObject({ value: null, gain: 0 });
  });

  it("rehydrates answered rows despite completion and skips, but never treats demographics as bike fields", () => {
    const profile = { ...completeProfile, sex: "prefer_not_to_say" as const, birthDate: "1990-01-01" };
    const state = input({ profile, bikes: [bike], history: [{ key: "rider:sex", skipCount: 3, profileOnly: true }] });
    expect(demographics(state)).toEqual([]);
    expect(describeProfilePrompt(state, { field: "sex" })).toMatchObject({ value: "prefer_not_to_say", gain: 0, completenessGain: 0 });
    expect(describeProfilePrompt(state, { field: "birthDate" })).toMatchObject({ value: "1990-01-01", kind: "declared", unit: "date" });
    for (const field of ["sex", "birthDate"]) {
      expect(describeProfilePrompt(state, { field, bikeId: bike._id })).toBeNull();
      expect(() => validatePromptValue(field, "female", true)).toThrow();
    }
  });

  it("delegates strict sex and real ISO birth-date validation to the shared registry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    try {
      for (const sex of ["female", "male", "prefer_not_to_say"]) expect(validatePromptValue("sex", sex)).toBe(sex);
      for (const value of ["unknown", "Female", "", null, 0]) expect(() => validatePromptValue("sex", value)).toThrow();
      for (const date of ["1992-02-29", "2016-10-03", "1926-10-03"]) expect(validatePromptValue("birthDate", date)).toBe(date);
      for (const value of ["1991-02-29", "1990-04-31", "1990-1-01", "01-01-1990", "1990-01-01T00:00:00Z", "2027-01-01", "2016-10-04", "1925-01-01", "", null, 1990]) {
        expect(() => validatePromptValue("birthDate", value)).toThrow();
      }
    } finally {
      vi.useRealTimers();
    }
  });
});
