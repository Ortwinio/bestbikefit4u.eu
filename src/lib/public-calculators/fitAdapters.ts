import { calculateBikeFit, calculateQuickEstimate } from "../../../convex/lib/fitAlgorithm";
import { calculateCrankLength, calculateSaddleHeight } from "../../../convex/lib/fitAlgorithm/calculations";
import { mapCoreScore, mapFlexibilityScore } from "../../../convex/lib/fitAlgorithm/validation";
import type {
  Ambition,
  BikeCategory,
  CalculationContext,
  FitInputs,
  FitOutputs,
} from "../../../convex/lib/fitAlgorithm/types";
import type { PublicFitScore } from "../publicCalculatorLogic";

type PublicBaselineFitInput = {
  category: BikeCategory;
  inseamSource?: "measured" | "estimated" | "missing";
};

type PublicRefinedFitInput = PublicBaselineFitInput & {
  ridingGoal: Ambition;
  flexibility: PublicFitScore;
  coreStability: PublicFitScore;
};

type BikeFitAdapterInput = PublicRefinedFitInput & {
  heightCm: number;
  inseamCm: number;
};

type SaddleHeightAdapterInput = PublicRefinedFitInput & {
  inseamCm: number;
};

type FrameSizeAdapterInput = PublicBaselineFitInput & {
  heightCm: number;
  inseamCm: number;
};

type CrankLengthAdapterInput = PublicBaselineFitInput & {
  inseamCm: number;
};

function cmToMm(valueCm: number): number {
  return Math.round(valueCm * 10);
}

function buildCalculationContext(input: SaddleHeightAdapterInput): CalculationContext {
  const inputs: FitInputs = {
    category: input.category,
    ambition: input.ridingGoal,
    heightMm: cmToMm(input.inseamCm * 2),
    inseamMm: cmToMm(input.inseamCm),
    flexibilityScore: mapFlexibilityScore(input.flexibility),
    coreScore: mapCoreScore(input.coreStability),
  };

  return {
    inputs,
    flexIndex: inputs.flexibilityScore - 5,
    coreIndex: inputs.coreScore - 5,
  };
}

export function runBikeFitCalculation(input: BikeFitAdapterInput): {
  fitResult: FitOutputs;
  quickEstimate: ReturnType<typeof calculateQuickEstimate>;
} {
  const fitInputs: FitInputs = {
    category: input.category,
    ambition: input.ridingGoal,
    heightMm: cmToMm(input.heightCm),
    inseamMm: cmToMm(input.inseamCm),
    flexibilityScore: mapFlexibilityScore(input.flexibility),
    coreScore: mapCoreScore(input.coreStability),
  };

  return {
    fitResult: calculateBikeFit(fitInputs),
    quickEstimate: calculateQuickEstimate({
      heightMm: fitInputs.heightMm,
      inseamMm: fitInputs.inseamMm,
      category: fitInputs.category,
    }),
  };
}

export function runSaddleHeightCalculation(input: SaddleHeightAdapterInput) {
  return calculateSaddleHeight(buildCalculationContext(input));
}

export function runFrameSizeCalculation(input: FrameSizeAdapterInput) {
  return calculateQuickEstimate({
    heightMm: cmToMm(input.heightCm),
    inseamMm: cmToMm(input.inseamCm),
    category: input.category,
  });
}

export function runCrankLengthCalculation(input: CrankLengthAdapterInput) {
  return calculateCrankLength(cmToMm(input.inseamCm), input.category);
}
