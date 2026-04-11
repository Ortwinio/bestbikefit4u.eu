import { classifySymptoms } from "./width-engine";
import type {
  SaddleSuitabilityResult,
  SaddleWidthInput,
  SaddleWidthResult,
} from "./types";

export function classifySaddleSuitability(
  input: SaddleWidthInput,
  widthResult: SaddleWidthResult
): SaddleSuitabilityResult {
  const symptoms = input.symptoms;
  const symptomSummary = classifySymptoms(symptoms);

  const noseType =
    input.ridingType === "tt_triathlon" ||
    (input.postureCategory === "aggressive" && !symptoms?.slidingForward)
      ? "short_nose"
      : "traditional_nose";

  const profileShape =
    input.ridingType === "gravel" ||
    input.ridingType === "mtb" ||
    (input.flexibilityScore ?? 0) >= 4
      ? "flat"
      : symptoms?.slidingForward ||
          (input.ridingType === "endurance_road" && (input.flexibilityScore ?? 3) < 3)
        ? "waved"
        : "moderate_wave";

  const cutoutRecommended =
    Boolean(symptoms?.numbness) ||
    input.indoorOutdoor === "indoor" ||
    input.postureCategory === "aggressive";

  const paddingPreference =
    input.ridingType === "road_race" ||
    input.ridingType === "tt_triathlon" ||
    input.typicalRideLength === "long" ||
    input.typicalRideLength === "ultra"
      ? "firm"
      : input.ridingType === "commuter_leisure" && input.postureCategory === "upright"
        ? "soft"
        : "medium";

  const saddleFamily =
    noseType === "short_nose"
      ? "short_nose_performance"
      : input.ridingType === "gravel" || input.ridingType === "mtb"
        ? "gravel_mtb_support"
        : input.ridingType === "commuter_leisure" && input.postureCategory === "upright"
          ? "comfort_upright"
          : "endurance_allroad";

  const fitInteractionWarnings: SaddleSuitabilityResult["fitInteractionWarnings"] = [];

  if (symptoms?.numbness && input.currentSaddleTilt === "nose_down") {
    fitInteractionWarnings.push({
      code: "numbness_tilt_likely",
      severity: "warning",
      message:
        "Your reported numbness may be partly caused by a nose-down saddle tilt. Check tilt before attributing it to saddle width alone.",
    });
  }
  if (symptoms?.handPressure) {
    fitInteractionWarnings.push({
      code: "hand_pressure_not_width",
      severity: "info",
      message:
        "Increased hand pressure is more likely related to reach or drop than saddle width.",
    });
  }
  if (symptoms?.asymmetry) {
    fitInteractionWarnings.push({
      code: "asymmetry_not_width",
      severity: "warning",
      message:
        "One-sided symptoms often point to pelvic tilt or cleat issues rather than saddle width.",
    });
  }
  if (widthResult.widthMatchAssessment === "good_match" && symptoms?.numbness) {
    fitInteractionWarnings.push({
      code: "good_width_check_setup",
      severity: "info",
      message:
        "Your current saddle width is close to the recommendation. Tilt and setback are more likely the contributing factor.",
    });
  }
  if (symptomSummary.dominant === "conflicting") {
    fitInteractionWarnings.push({
      code: "conflicting_symptoms",
      severity: "warning",
      message:
        "Your symptoms point in different directions. A professional fit assessment may be more effective than a width change alone.",
    });
  }

  const shapeFlags = [
    noseType === "short_nose" ? "Shorter nose suits the riding posture." : "Traditional nose keeps fore-aft support.",
    profileShape === "flat"
      ? "Flatter shell supports off-road or mobile pelvic movement."
      : profileShape === "waved"
        ? "More wave can help resist sliding forward."
        : "Moderate wave balances support and freedom.",
    cutoutRecommended
      ? "Central pressure relief is recommended."
      : "Full shell support is likely sufficient.",
    paddingPreference === "firm"
      ? "Firmer padding keeps support stable under sustained load."
      : paddingPreference === "soft"
        ? "Softer padding suits shorter, upright rides."
        : "Medium padding balances support and comfort.",
  ];

  return {
    saddleFamily,
    noseType,
    profileShape,
    cutoutRecommended,
    paddingPreference,
    fitInteractionWarnings,
    shapeFlags,
  };
}
