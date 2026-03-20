import type { Doc } from "../_generated/dataModel";

type BikeProfileType =
  | "base"
  | "mountain"
  | "climbing"
  | "endurance"
  | "performance"
  | "aero"
  | "indoor"
  | "technical"
  | "comfort"
  | "custom";

export function getSystemDefaultBikeProfile(
  bike: Pick<Doc<"bikes">, "ridingStyle" | "bikeType">
): { name: string; profileType: BikeProfileType } {
  switch (bike.ridingStyle) {
    case "recreational":
      return { name: "Recreational", profileType: "comfort" };
    case "fitness":
      return { name: "Fitness", profileType: "endurance" };
    case "sportive":
      return { name: "Sportive", profileType: "endurance" };
    case "racing":
      return { name: "Racing", profileType: "performance" };
    case "commuting":
      return { name: "Commuting", profileType: "base" };
    case "touring":
      return { name: "Touring", profileType: "comfort" };
    default:
      return bike.bikeType === "mountain"
        ? { name: "Mountain", profileType: "mountain" }
        : { name: "Base", profileType: "base" };
  }
}

export function getSystemClimbingBikeProfile(
  bike: Pick<Doc<"bikes">, "bikeType">
): { name: string; profileType: BikeProfileType } | null {
  switch (bike.bikeType) {
    case "road":
    case "gravel":
    case "mountain":
    case "cyclocross":
    case "touring":
    case "tt_triathlon":
      return { name: "Climbing", profileType: "climbing" };
    default:
      return null;
  }
}
