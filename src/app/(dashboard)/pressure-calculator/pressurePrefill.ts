import type { Doc } from "../../../../convex/_generated/dataModel";
import type { PressureCalculatorValues } from "@/components/features/pressure/PressureCalculatorForm";

export function buildPressurePrefill({ saved, bike, profile, tires }: {
  saved?: Pick<Doc<"pressureCalculations">, "inputSnapshot"> | null;
  bike?: Pick<Doc<"bikes">, "discipline" | "bikeType" | "bikeWeightKg"> | null;
  profile?: Pick<Doc<"profiles">, "weightKg"> | null;
  tires?: Pick<Doc<"tireSetups">, "widthFrontMm" | "widthRearMm" | "tubeType"> | null;
}): PressureCalculatorValues {
  const savedInput = saved?.inputSnapshot;
  const discipline = savedInput?.discipline ?? bike?.discipline ??
    (bike?.bikeType === "mountain" ? "mtb" : bike?.bikeType === "gravel" ? "gravel" : "road");
  return {
    discipline: discipline === "tt" ? "road" : discipline,
    bodyWeightKg: savedInput?.bodyWeightKg ?? profile?.weightKg ?? 75,
    widthFrontMm: savedInput?.widthFrontMm ?? tires?.widthFrontMm ?? 28,
    widthRearMm: savedInput?.widthRearMm ?? tires?.widthRearMm ?? 28,
    tubeType: savedInput?.tubeType ?? tires?.tubeType ?? "tubeless",
    surface: savedInput?.surface ?? "average_asphalt",
    ridingGoal: savedInput?.ridingGoal,
    bikeWeightKg: savedInput ? savedInput.bikeWeightKg : bike?.bikeWeightKg,
  };
}
