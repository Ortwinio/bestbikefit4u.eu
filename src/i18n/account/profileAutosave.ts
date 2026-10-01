export const profileAutosaveCopy = {
  nl: {
    extra: "Extra lichaamsmaten",
    guidance: "Pas je waarden direct aan. Je kunt de meetinstructies erbij houden.",
    flexibilityGuide: "Zo test je je flexibiliteit",
    coreGuide: "Zo test je je rompstabiliteit",
  },
  en: {
    extra: "Additional body measurements",
    guidance: "Adjust your values directly. Keep the measurement instructions nearby.",
    flexibilityGuide: "How to test your flexibility",
    coreGuide: "How to test your core stability",
  },
};

export const profileMeasurementInstructions = {
  heightCm: [
    "Stand barefoot against a wall",
    "Place a book flat on top of your head, touching the wall",
    "Mark the wall and measure from the floor to the mark",
  ],
  inseamCm: [
    "Stand barefoot with feet 10–15 cm apart",
    "Press a hardcover book firmly up between your legs, simulating a saddle",
    "Measure from the floor to the top of the book spine",
  ],
  torsoLengthCm: [
    "Sit upright on a firm chair, back straight",
    "Measure from the seat surface to the bony bump at the base of your neck (C7 vertebra)",
  ],
  armLengthCm: [
    "Stand with arm relaxed at your side",
    "Measure from the bony shoulder tip (acromion) to the middle finger tip",
  ],
  shoulderWidthCm: [
    "Stand relaxed with arms at sides",
    "Measure between the outermost bony points of both shoulders (acromion to acromion)",
  ],
  femurLengthCm: [
    "Sit on a hard surface with your thigh horizontal",
    "Measure from the bony hip point (greater trochanter) to the outside of the knee",
  ],
} as const;

export function profileMeasurementWarning(locale: Locale, field: "inseam" | "weight", height: number, value: number) {
  const predicted = field === "inseam" ? Math.round(height * 0.47) : Math.round(22 * (height / 100) ** 2);
  if (Math.abs(value - predicted) / predicted <= 0.2) return null;
  const unit = field === "inseam" ? "cm" : "kg";
  if (locale === "nl") return measurementWarningNl(field, value, predicted, unit);
  const direction = field === "inseam" ? (value > predicted ? "longer" : "shorter")
    : (value > predicted ? "heavier" : "lighter");
  const action = field === "inseam" ? "double-check your measurement." : "verify the value is correct.";
  return `${value} ${unit} is more than 20% ${direction} than expected for your height (${predicted} ${unit}) — ${action}`;
}
import type { Locale } from "@/i18n/config";
import { measurementWarningNl } from "./profileLanguage";
