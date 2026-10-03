import type { Doc } from "../../../../convex/_generated/dataModel";
import type { PressureCalculatorValues } from "@/components/features/pressure/PressureCalculatorForm";

export function buildPressurePrefill({ saved, bike, profile, tires }: {
  saved?: Pick<Doc<"pressureCalculations">, "inputSnapshot"> | null;
  bike?: Pick<Doc<"bikes">, "discipline" | "bikeType" | "bikeWeightKg" | "primaryGoal"> | null;
  profile?: Pick<Doc<"profiles">, "weightKg"> | null;
  tires?: Pick<Doc<"tireSetups">, "widthFrontMm" | "widthRearMm" | "tubeType"> | null;
}): PressureCalculatorValues {
  const savedInput = saved?.inputSnapshot;
  const discipline = bike?.discipline ?? (bike?.bikeType
    ? bike.bikeType === "mountain" ? "mtb" : bike.bikeType === "gravel" ? "gravel" : "road"
    : savedInput?.discipline ?? "road");
  return {
    discipline: discipline === "tt" ? "road" : discipline,
    bodyWeightKg: profile?.weightKg ?? savedInput?.bodyWeightKg ?? 75,
    widthFrontMm: tires?.widthFrontMm ?? savedInput?.widthFrontMm ?? 28,
    widthRearMm: tires?.widthRearMm ?? savedInput?.widthRearMm ?? 28,
    tubeType: tires?.tubeType ?? savedInput?.tubeType ?? "tubeless",
    surface: savedInput?.surface ?? "average_asphalt",
    ridingGoal: bike?.primaryGoal === "comfort" ? "comfort" : bike?.primaryGoal === "balanced" ? "balance"
      : bike?.primaryGoal === "performance" || bike?.primaryGoal === "aerodynamics" ? "speed" : savedInput?.ridingGoal,
    bikeWeightKg: bike?.bikeWeightKg ?? savedInput?.bikeWeightKg,
  };
}
