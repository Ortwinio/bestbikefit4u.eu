import type { CalculatorValues } from "../calculatorStates/validators";
import type { Doc } from "../_generated/dataModel";
import { mapBikeCategory } from "../recommendations/inputMapping";

type BikeFitInputs = CalculatorValues<"bike-fit">;

const flexibilityScores = [
  "very_limited", "limited", "average", "good", "excellent",
] as const;

export function calculatorMatchesBike(inputs: BikeFitInputs, bikeType: string | undefined): boolean {
  return !!bikeType && mapBikeCategory(
    { ridingStyle: "", primaryGoal: "" }, bikeType,
  ) === inputs.category;
}

export function calculatorAmbition(inputs: BikeFitInputs) {
  return inputs.ambition === "aero" && (inputs.category === "city" || inputs.category === "mtb")
    ? "performance"
    : inputs.ambition;
}

export function calculatorPrimaryGoal(inputs: BikeFitInputs) {
  const ambition = calculatorAmbition(inputs);
  return ambition === "aero" ? "aerodynamics" : ambition;
}

export function profileWithCalculatorInputs(
  profile: Doc<"profiles">,
  inputs: BikeFitInputs | undefined,
): Doc<"profiles"> {
  if (!inputs) return profile;
  return {
    ...profile,
    heightCm: inputs.heightCm,
    inseamCm: inputs.inseamCm,
    flexibilityScore: flexibilityScores[inputs.flexibility - 1],
    coreStabilityScore: inputs.core,
  };
}
