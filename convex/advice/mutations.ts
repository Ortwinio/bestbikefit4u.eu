import { mutation } from "../_generated/server";
import { resetAdviceProgress } from "./revision";
import type { Doc } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";
import { calculateGearingAnalysis } from "../../src/lib/gearing-engine";
import { calculateSaddleWidth, classifySaddleSuitability, type SaddleWidthInput } from "../../src/lib/saddle-width-engine";
import { calculateBasicPressure, calculateAdvancedPressure, validatePressureInput, type AdvancedPressureInput } from "../../src/lib/pressure-engine";
import { captureInputProvenance, capturePressureInputProvenance, directInputs, calculatorUsedInputs,
  gearingUsedInputs, valueAt, type InputProvenance } from "./provenance";
import { recalculateState } from "./recalculateState";
import { generateRecommendation } from "../recommendations/mutations";
import { hasFitMeasurements } from "../../shared/profileFitReadiness";

export type RecalculationItem = { source: string; id: string;
  status: "updated" | "pending" | "skipped" | "failed"; reason?: string; replacementId?: string };

function latest<Row extends { bikeId?: string; createdAt?: number; updatedAt?: number }>(rows: Row[], extra: (row: Row) => string = () => "") {
  const seen = new Set<string>();
  return [...rows].sort((left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0))
    .filter(row => { const key = `${row.bikeId ?? "rider"}:${extra(row)}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
}

export const recalculateAll = mutation({
  args: {},
  handler: async (ctx): Promise<{ items: RecalculationItem[] }> => {
    const userId = await requireUserId(ctx);
    const [profile, bikes, gearing, saddle, pressure, states, recommendations] = await Promise.all([
      ctx.db.query("profiles").withIndex("by_user", range => range.eq("userId", userId)).unique(),
      ctx.db.query("bikes").withIndex("by_user", range => range.eq("userId", userId)).collect(),
      ctx.db.query("gearingSessions").withIndex("by_user", range => range.eq("userId", userId)).collect(),
      ctx.db.query("saddleWidthSessions").withIndex("by_user", range => range.eq("userId", userId)).collect(),
      ctx.db.query("pressureCalculations").withIndex("by_user", range => range.eq("userId", userId)).collect(),
      ctx.db.query("calculatorStates").withIndex("by_user_updated", range => range.eq("userId", userId)).collect(),
      ctx.db.query("recommendations").withIndex("by_user", range => range.eq("userId", userId)).collect(),
    ]);
    const items: RecalculationItem[] = [];
    async function attempt(source: string, row: { _id: string; bikeId?: string; inputProvenance?: InputProvenance }, calculate: (bike: Doc<"bikes"> | undefined) => Promise<string | void>) {
      const bike = bikes.find(candidate => candidate._id === row.bikeId);
      if (row.bikeId && !bike) { items.push({ source, id: row._id, status: "skipped", reason: "BIKE_UNAVAILABLE" }); return; }
      try {
        for (const dependency of row.inputProvenance?.dependencies ?? []) {
          if (!dependency.record && valueAt(dependency.bikeId ? bike : profile, dependency.field) === undefined) {
            throw new Error("MISSING_CURRENT_INPUTS");
          }
        }
        const replacementId = await calculate(bike);
        items.push({ source, id: row._id, status: replacementId ? "pending" : "updated",
          ...(replacementId ? { replacementId } : {}) });
      } catch (error) {
        const reason = error instanceof Error && ["MISSING_CURRENT_INPUTS", "FIT_UNAVAILABLE", "FIT_ALREADY_PROCESSING"].includes(error.message)
          ? error.message : "CALCULATION_FAILED";
        items.push({ source, id: row._id, status: reason === "CALCULATION_FAILED" ? "failed" : "skipped", reason });
      }
    }
    for (const row of latest(gearing.filter(row => row.sessionType === "dashboard"))) await attempt("gearingSessions", row, async bike => {
      const input = { ...row.input };
      if (profile?.weightKg !== undefined) { input.riderWeightKg = profile.weightKg; }
      else if (input.riderWeightKg !== undefined) throw new Error("MISSING_CURRENT_INPUTS");
      if (profile?.ftpWatts !== undefined) { input.ftpWatts = profile.ftpWatts; }
      else if (input.ftpWatts !== undefined) throw new Error("MISSING_CURRENT_INPUTS");
      if (bike && !bike.gearing) throw new Error("MISSING_CURRENT_INPUTS");
      if (bike?.gearing) {
        if (!bike.gearing.chainrings || !bike.gearing.cassetteTeeth || bike.gearing.wheelCircumferenceMm === undefined) {
          throw new Error("MISSING_CURRENT_INPUTS");
        }
        input.chainrings = bike.gearing.chainrings; input.cassetteTeeth = bike.gearing.cassetteTeeth;
        input.wheelCircumferenceMm = bike.gearing.wheelCircumferenceMm;
        input.drivetrainType = input.chainrings.length === 1 ? "1x" : "2x";
      }
      if (bike) {
        input.bikeType = bike.bikeType;
        input.bikeWeightKg = bike.bikeWeightKg;
      }
      if (bike?.currentSetup?.crankLengthMm !== undefined) {
        input.crankLengthMm = bike.currentSetup.crankLengthMm;
      }
      const result = calculateGearingAnalysis(input);
      const inputProvenance = await captureInputProvenance(ctx, userId, gearingUsedInputs(input, row.bikeId), row.bikeId);
      await ctx.db.patch(row._id, { ...resetAdviceProgress(row), input, math: result.math, suitability: result.suitability, inputProvenance, createdAt: Date.now() });
    });
    for (const row of latest(saddle.filter(row => row.sessionType === "dashboard"))) await attempt("saddleWidthSessions", row, async bike => {
      const input: SaddleWidthInput = { ...row, inputMethod: row.measurementMethod,
        ridingType: row.ridingType as SaddleWidthInput["ridingType"], postureCategory: row.postureCategory as SaddleWidthInput["postureCategory"],
        indoorOutdoor: row.indoorOutdoor as SaddleWidthInput["indoorOutdoor"], typicalRideLength: row.typicalRideLength as SaddleWidthInput["typicalRideLength"],
        currentSaddleShape: row.currentSaddleShape as SaddleWidthInput["currentSaddleShape"],
        currentSaddleTilt: row.currentSaddleTilt as SaddleWidthInput["currentSaddleTilt"], symptoms: undefined };
      if (row.measurementMethod === "measured") {
        if (profile?.sitBoneWidthMm === undefined) throw new Error("MISSING_CURRENT_INPUTS");
        input.sitBoneWidthMm = profile.sitBoneWidthMm;
      } else {
        if (profile?.heightCm === undefined || profile.weightKg === undefined) throw new Error("MISSING_CURRENT_INPUTS");
        input.heightCm = profile.heightCm; input.weightKg = profile.weightKg;
      }
      const flexibility = ["very_limited", "limited", "average", "good", "excellent"].indexOf(profile?.flexibilityScore ?? "") + 1;
      if (flexibility) input.flexibilityScore = flexibility;
      if (profile?.coreStabilityScore !== undefined) input.coreStabilityScore = profile.coreStabilityScore;
      const saddleWidth = valueAt(bike, "saddleWidthMm");
      if (typeof saddleWidth === "number") input.currentSaddleWidthMm = saddleWidth;
      if (row.symptoms) input.symptoms = Object.fromEntries(["sisBonePain", "numbness", "chafing", "slidingForward", "instability", "lowerBackPressure", "handPressure", "asymmetry"]
        .map(key => [key, row.symptoms!.includes(key)])) as unknown as SaddleWidthInput["symptoms"];
      const width = calculateSaddleWidth(input);
      const suitability = classifySaddleSuitability(input, width);
      const fields = row.measurementMethod === "measured" ? ["sitBoneWidthMm"] : ["heightCm", "weightKg"];
      if (flexibility) fields.push("flexibilityScore");
      if (profile?.coreStabilityScore !== undefined) fields.push("coreStabilityScore");
      const inputProvenance = await captureInputProvenance(ctx, userId, [...directInputs(profile ?? {}, fields),
        ...(bike && typeof saddleWidth === "number" ? directInputs(bike, ["saddleWidthMm"], bike._id) : [])], row.bikeId);
      await ctx.db.patch(row._id, { ...resetAdviceProgress(row), sitBoneWidthMm: input.sitBoneWidthMm, heightCm: input.heightCm, weightKg: input.weightKg,
        flexibilityScore: input.flexibilityScore, coreStabilityScore: input.coreStabilityScore,
        currentSaddleWidthMm: input.currentSaddleWidthMm,
        recommendedWidthMm: width.finalRecommendedWidthMm, widthRangeMinMm: width.widthRangeMinMm, widthRangeMaxMm: width.widthRangeMaxMm,
        primaryWidthClass: width.primaryWidthClass, confidenceScore: width.confidenceScore, confidenceLevel: width.confidenceLevel,
        explanationKey: width.explanationKey, widthMatchScore: width.widthMatchScore,
        saddleFamily: suitability.saddleFamily, noseType: suitability.noseType, profileShape: suitability.profileShape,
        cutoutRecommended: suitability.cutoutRecommended, paddingPreference: suitability.paddingPreference,
        fitInteractionWarnings: suitability.fitInteractionWarnings.map(warning => warning.code), inputProvenance, createdAt: Date.now() });
    });
    for (const row of latest(pressure, row => row.sourceType)) await attempt("pressureCalculations", row, async bike => {
      if (profile?.weightKg === undefined) throw new Error("MISSING_CURRENT_INPUTS");
      const input = { ...row.inputSnapshot, bodyWeightKg: profile.weightKg };
      if (bike) {
        input.bikeWeightKg = bike.bikeWeightKg;
        input.discipline = bike.bikeType === "mountain" ? "mtb" : bike.bikeType === "tt_triathlon" ? "tt"
          : ["gravel", "cyclocross", "touring"].includes(bike.bikeType) ? "gravel" : "road";
        const front = valueAt(bike, "tires.widthFrontMm");
        const rear = valueAt(bike, "tires.widthRearMm");
        const tube = valueAt(bike, "tires.tubeType");
        if (typeof front === "number") input.widthFrontMm = front;
        if (typeof rear === "number") input.widthRearMm = rear;
        if (tube === "inner_tube" || tube === "latex_tube" || tube === "tubeless") input.tubeType = tube;
      }
      let tireLimit: number | undefined;
      if (row.tireSetupId) {
        const tire = await ctx.db.get(row.tireSetupId);
        const wheel = tire ? await ctx.db.get(tire.wheelsetId) : null;
        if (!tire || tire.userId !== userId || !wheel || wheel.userId !== userId || wheel.bikeId !== row.bikeId) {
          throw new Error("MISSING_CURRENT_INPUTS");
        }
        input.widthFrontMm = tire.widthFrontMm; input.widthRearMm = tire.widthRearMm;
        input.tubeType = tire.tubeType; input.casingType = tire.casingType;
        input.rimType = wheel.rimType; input.internalRimWidthFrontMm = wheel.internalRimWidthFrontMm;
        input.internalRimWidthRearMm = wheel.internalRimWidthRearMm;
        tireLimit = tire.maxPressureBar;
      }
      if (validatePressureInput(input).length) throw new Error("INVALID_INPUTS");
      const result = row.sourceType === "dashboard_advanced" ? calculateAdvancedPressure({ ...input, maxPressureBar: tireLimit } as AdvancedPressureInput) : calculateBasicPressure(input);
      const inputProvenance = await capturePressureInputProvenance(ctx, userId, { ...input, maxPressureBar: tireLimit }, row.bikeId, row.tireSetupId);
      await ctx.db.patch(row._id, { ...resetAdviceProgress(row), inputSnapshot: input, recommendedFrontBar: result.frontBar, recommendedRearBar: result.rearBar,
        recommendedFrontPsi: result.frontPsi, recommendedRearPsi: result.rearPsi, comfortScore: result.comfortScore,
        gripScore: result.gripScore, efficiencyScore: result.efficiencyScore, warningsJson: JSON.stringify(result.warnings),
        inputProvenance, createdAt: Date.now() });
    });
    for (const row of latest(states, row => row.calculator)) await attempt("calculatorStates", row, async bike => {
      const result = recalculateState(row.state, profile, bike);
      const inputProvenance = await captureInputProvenance(ctx, userId, calculatorUsedInputs(result.state, row.bikeId), row.bikeId);
      await ctx.db.patch(row._id, { ...result, ...resetAdviceProgress(row), inputProvenance, updatedAt: Date.now() });
    });
    for (const row of latest(recommendations)) await attempt("recommendations", row, async bike => {
      if (!profile || !hasFitMeasurements(profile)) throw new Error("MISSING_CURRENT_INPUTS");
      const session = await ctx.db.get(row.sessionId);
      if (!session || session.userId !== userId) throw new Error("FIT_UNAVAILABLE");
      if (session.bikeProfileId) {
        const bikeProfile = await ctx.db.get(session.bikeProfileId);
        if (!bikeProfile || bikeProfile.userId !== userId ||
          !bikes.some(candidate => candidate._id === bikeProfile.bikeId) ||
          (row.bikeId && bikeProfile.bikeId !== row.bikeId)) throw new Error("FIT_UNAVAILABLE");
      }
      const active = await ctx.db.query("fitSessions").withIndex("by_user_status", range => range.eq("userId", userId).eq("status", "processing")).collect();
      if (active.some(candidate => candidate.bikeId === row.bikeId)) throw new Error("FIT_ALREADY_PROCESSING");
      const responses = await ctx.db.query("questionnaireResponses").withIndex("by_session", range => range.eq("sessionId", session._id)).collect();
      const sessionId = await ctx.db.insert("fitSessions", { userId, profileId: profile._id, bikeId: row.bikeId,
        bikeProfileId: session.bikeProfileId,
        bikeType: bike?.bikeType ?? session.bikeType, ridingStyle: session.ridingStyle, primaryGoal: session.primaryGoal,
        engineVersion: session.engineVersion, status: "questionnaire_complete", createdAt: Date.now(),
        weeklyHours: session.weeklyHours, longestRideKm: session.longestRideKm, painPoints: session.painPoints });
      const answerIds = [];
      try { for (const response of responses) {
        const { _id, _creationTime, ...answer } = response;
        void _id; void _creationTime;
        answerIds.push(await ctx.db.insert("questionnaireResponses", { ...answer, sessionId }));
      }
      await generateRecommendation(ctx, { sessionId, suppressEmail: true });
      } catch (error) {
        for (const answerId of answerIds) await ctx.db.delete(answerId);
        await ctx.db.delete(sessionId);
        throw error;
      }
      return sessionId;
    });
    return { items };
  },
});
