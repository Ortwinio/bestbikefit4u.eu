import { describe, expect, it } from "vitest";
import { readUsabilityAccountState } from "./account-states";
const input = { profile: { heightCm: 178, inseamCm: 83, weightKg: 74 }, bike: { _id: "visual-bike" },
  values: {}, mode: "open" as const };
describe("offline usability account states", () => {
  it("uses actual open/free pricing policy instead of inventing locked defaults", () => {
    expect(readUsabilityAccountState("pricing/queries:getAccess", input)).toMatchObject({
      handled: true, value: { fullReport: true, profileScoreCap: 100, enforced: false },
    });
    expect(readUsabilityAccountState("pricing/queries:getAccess", { ...input, mode: "free" })).toMatchObject({
      handled: true, value: { fullReport: false, profileScoreCap: 80, enforced: true },
    });
  });
  it("renders saddle advice from the shared model and never claims three measurements", () => {
    expect(readUsabilityAccountState("reliability/queries:getSaddleState", input)).toMatchObject({
      handled: true, value: { canUseKneeAngle: true, measurements: [], latestKneeAngle: null,
        model: { adviceMm: expect.any(Number) } },
    });
  });
  it("keeps unknown queries visible as errors in the outer adapter", () => {
    expect(readUsabilityAccountState("unknown", input)).toEqual({ handled: false });
  });
});

describe("current fixture API contracts", () => {
  it("distinguishes paid from flag-off without changing the shared pricing policy", () => {
    expect(readUsabilityAccountState("pricing/queries:getAccess", { ...input, mode: "paid" })).toMatchObject({
      value: { enforced: true, fullReport: true, maxBikes: null, productId: "annual" },
    });
  });
  it("keeps signed-in calculator input provenance and uses one actual measurement", () => {
    expect(readUsabilityAccountState("calculatorData/queries:get", input)).toMatchObject({
      value: { userId: "visual-user", entries: expect.arrayContaining([
        expect.objectContaining({ field: "inseamCm", value: 83, method: "measured", repeatCount: 1 }),
      ]) },
    });
  });
  it("derives pressure report data and advice from the real pressure engine", () => {
    const state = readUsabilityAccountState("recommendations/queries:getReportV2", { ...input,
      values: { "recommendations/queries:getReportV2": { recommendation: { calculatedFit: { saddleHeightMm: 733 } } } },
    });
    expect(state).toMatchObject({ value: { latestPressureCalculation: {
      recommendedFrontBar: expect.any(Number), recommendedRearBar: expect.any(Number),
      recommendedFrontPsi: expect.any(Number), recommendedRearPsi: expect.any(Number),
    } } });
    const advice = readUsabilityAccountState("advice/queries:listAdviceGroups", input);
    expect(advice).toMatchObject({ value: expect.arrayContaining([
      expect.objectContaining({ key: "tires", items: expect.arrayContaining([
        expect.objectContaining({ key: "pressureFrontBar" }), expect.objectContaining({ key: "pressureRearBar" }),
      ]) }),
    ]) });
  });
  it("preserves deliberate empty and loading states without hiding unknown queries", () => {
    expect(readUsabilityAccountState("unknown", { ...input, fixture: "loading" })).toEqual({ handled: false });
    expect(readUsabilityAccountState("reliability/queries:getSaddleState", { ...input,
      values: { "profiles/queries:getMyProfile": null } })).toMatchObject({ value: { model: null, profile: null } });
  });
});

it("returns report access only for the owned session and preserves free latest export", () => {
  const report = (id: string, createdAt: number) => ({
    session: { _id: id, userId: "visual-user", createdAt }, recommendation: { createdAt },
  });
  const values = { "sessions/queries:getAllSessionsWithBikes": [report("older", 1), report("latest", 2)] };
  const read = (sessionId: string, mode: "free" | "open" | "paid" = "free") =>
    readUsabilityAccountState("recommendations/queries:getReportAccess", { ...input, values, mode,
      args: { sessionId } });
  expect(read("latest")).toMatchObject({ value: { enforced: true, fullReport: false,
    isLatestReport: true, canDownloadPdf: true, canEmailReport: true } });
  expect(read("older")).toMatchObject({ value: { canDownloadPdf: false, canEmailReport: false } });
  expect(read("older", "open")).toMatchObject({ value: { enforced: false, canEmailReport: true } });
  expect(read("older", "paid")).toMatchObject({ value: { enforced: true, fullReport: true, canEmailReport: true } });
  expect(read("unknown")).toMatchObject({ value: null });
});

it("returns actual subscription shape for settings, without transition offer invention", () => {
  expect(readUsabilityAccountState("pricing/queries:getSubscription", { ...input, mode: "paid" }))
    .toMatchObject({ value: { access: { productId: "annual" }, transitionOffer: null,
      entitlements: [expect.objectContaining({ productId: "annual", status: "active" })] } });
});

it("provides the bike-detail pressure engine fixture only for its owned bike", () => {
  expect(readUsabilityAccountState("pressureCalculations/queries:getLatestForBike", {
    ...input, args: { bikeId: "visual-bike" },
  })).toMatchObject({ value: { recommendedFrontBar: expect.any(Number), recommendedRearBar: expect.any(Number) } });
  expect(readUsabilityAccountState("pressureCalculations/queries:getLatestForBike", {
    ...input, args: { bikeId: "other-bike" },
  })).toMatchObject({ value: null });
});
