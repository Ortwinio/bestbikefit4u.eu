import type { CalculatorValues } from "../calculatorStates/validators";
import { mapBikeCategory } from "../recommendations/inputMapping";

type BikeFitInputs = CalculatorValues<"bike-fit">;

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

