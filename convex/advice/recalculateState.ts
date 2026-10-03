import type { Doc } from "../_generated/dataModel";
import type { CalculatorState } from "../calculatorStates/validators";
import { validCalculatorState } from "../../src/lib/calculators/accountState";
import { runBikeFitCalculation, runCrankLengthCalculation, runFrameSizeCalculation, runSaddleHeightCalculation } from "../../src/lib/public-calculators/fitAdapters";
import { climbPlan, ftpEstimate, fuelHydration, powerAtSpeed, speedAtPower } from "../../src/lib/public-calculators/performance";

export type AdviceOutput = { key: string; value: number | string; unit: string };

export function recalculateState(saved: CalculatorState, profile: Doc<"profiles"> | null, bike?: Doc<"bikes">) {
  const state = structuredClone(saved);
  const output: AdviceOutput[] = [];
  const add = (key: string, value: number, unit: string) => {
    if (!Number.isFinite(value)) throw new Error("INVALID_RESULT");
    output.push({ key, value, unit });
  };
  if ("values" in state.values) {
    const settings = state.values;
    const values = settings.values;
    if (bike && (state.calculator === "power-speed" || state.calculator === "climb-planner")) {
      if (!["road", "gravel", "mountain", "city", "tt_triathlon"].includes(bike.bikeType)) throw new Error("MISSING_CURRENT_INPUTS");
      settings.bike = bike.bikeType as typeof settings.bike;
      if (state.calculator === "power-speed") {
        if (bike.bikeWeightKg === undefined) throw new Error("MISSING_CURRENT_INPUTS");
        values.bikeMass = bike.bikeWeightKg;
      }
    }
    if (state.calculator !== "fuel-hydration") {
      if (profile?.weightKg === undefined) throw new Error("MISSING_CURRENT_INPUTS");
      values.riderMass = profile.weightKg;
      if (profile.ftpWatts !== undefined) values.ftp = profile.ftpWatts;
    }
    if (!validCalculatorState(state)) throw new Error("INVALID_INPUTS");
    const conditions = { riderMassKg: values.riderMass, bikeMassKg: values.bikeMass,
      bike: settings.bike, surface: settings.surface, gradientPct: values.gradient };
    if (state.calculator === "power-speed") {
      if (settings.mode === "power") add("speed", speedAtPower(conditions, values.power).speedKmh, "km/h");
      else add("power", powerAtSpeed(conditions, values.speed), "W");
    } else if (state.calculator === "ftp-wkg") {
      if (settings.method === "known" && profile?.ftpWatts === undefined) throw new Error("MISSING_CURRENT_INPUTS");
      const watts = settings.method === "known" ? values.ftp : settings.method === "twentyMinute" ? values.twentyMinute : values.ramp;
      const result = ftpEstimate(settings.method, watts, values.riderMass);
      add("ftp", result.ftpWatts, "W");
      add("wattsPerKg", result.wattsPerKg, "W/kg");
    } else if (state.calculator === "climb-planner") {
      if (profile?.ftpWatts === undefined) throw new Error("MISSING_CURRENT_INPUTS");
      const result = climbPlan({ distanceKm: values.distance, gradientPct: values.climbGradient,
        ftpWatts: values.ftp, riderMassKg: values.riderMass, bike: settings.bike });
      add("climbPower", result.targetPowerWatts, "W");
    } else if (state.calculator === "fuel-hydration") {
      const result = fuelHydration({ durationHours: values.duration, temperatureC: values.temperature,
        sweat: settings.sweat, bottleSizeMl: values.bottleSize });
      add("fluid", result.selectedFluidLitresPerHour, "L/h");
      if (result.carbohydrate.gramsPerHour !== null) add("carbohydrate", result.carbohydrate.gramsPerHour, "g/h");
    }
  } else {
    if (profile?.inseamCm === undefined) throw new Error("MISSING_CURRENT_INPUTS");
    state.values.inseamCm = profile.inseamCm;
    if (state.calculator === "frame-size" || state.calculator === "bike-fit") {
      if (profile.heightCm === undefined) throw new Error("MISSING_CURRENT_INPUTS");
      state.values.heightCm = profile.heightCm;
    }
    if (state.calculator === "saddle-height" || state.calculator === "bike-fit") {
      const flexibility = ["very_limited", "limited", "average", "good", "excellent"].indexOf(profile.flexibilityScore ?? "") + 1;
      if (!flexibility || profile.coreStabilityScore === undefined) throw new Error("MISSING_CURRENT_INPUTS");
      state.values.flexibility = flexibility;
      state.values.core = profile.coreStabilityScore;
      if (!profile.positionPriority) throw new Error("MISSING_CURRENT_INPUTS");
      state.values.ambition = profile.positionPriority;
      state.values.source = "estimated";
    }
    if (!validCalculatorState(state)) throw new Error("INVALID_INPUTS");
    if (state.calculator === "crank-length") {
      state.values.confirmed = true;
      add("crankLength", runCrankLengthCalculation(state.values), "mm");
    }
    if (state.calculator === "frame-size") {
      const result = runFrameSizeCalculation(state.values);
      state.values.heightConfirmed = true;
      state.values.inseamConfirmed = true;
      output.push({ key: "frameSize", value: result.estimatedFrameSize, unit: "" });
    }
    if (state.calculator === "saddle-height" || state.calculator === "bike-fit") {
      const values = state.values;
      const input = { ...values, ridingGoal: values.ambition,
        flexibility: values.flexibility as 1 | 2 | 3 | 4 | 5, coreStability: values.core as 1 | 2 | 3 | 4 | 5 };
      if (state.calculator === "saddle-height") add("saddleHeight", runSaddleHeightCalculation(input).height, "mm");
      else {
        const result = runBikeFitCalculation({ ...input, heightCm: state.values.heightCm });
        add("saddleHeight", result.fitResult.saddleHeightMm, "mm");
        add("saddleSetback", result.fitResult.saddleSetbackMm, "mm");
        add("barDrop", result.fitResult.barDropMm, "mm");
        add("saddleToBarReach", result.fitResult.saddleToBarReachMm, "mm");
        add("frameStack", result.fitResult.frameStackTargetMm, "mm");
        add("frameReach", result.fitResult.frameReachTargetMm, "mm");
      }
    }
  }
  return { state, adviceOutput: output };
}
