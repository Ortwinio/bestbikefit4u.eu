import { z } from "zod";

// Step 1: Basic body measurements
export const bodyMeasurementsSchema = z.object({
  heightCm: z
    .number()
    .min(130, "Height must be at least 130 cm")
    .max(210, "Height must be at most 210 cm"),
  inseamCm: z
    .number()
    .min(55, "Inseam must be at least 55 cm")
    .max(105, "Inseam must be at most 105 cm"),
});

// Validation: inseam should be less than 55% of height
export const validateInseamRatio = (heightCm: number, inseamCm: number) => {
  const ratio = inseamCm / heightCm;
  if (ratio >= 0.55) {
    return "Inseam seems too long relative to height. Please re-measure.";
  }
  if (ratio < 0.40) {
    return "Inseam seems too short relative to height. Please re-measure.";
  }
  return null;
};

// Step 2: Optional advanced measurements
export const advancedMeasurementsSchema = z.object({
  torsoLengthCm: z
    .number()
    .min(45, "Torso length must be at least 45 cm")
    .max(75, "Torso length must be at most 75 cm")
    .optional(),
  armLengthCm: z
    .number()
    .min(45, "Arm length must be at least 45 cm")
    .max(75, "Arm length must be at most 75 cm")
    .optional(),
  femurLengthCm: z
    .number()
    .min(35, "Femur length must be at least 35 cm")
    .max(60, "Femur length must be at most 60 cm")
    .optional(),
  shoulderWidthCm: z
    .number()
    .min(30, "Shoulder width must be at least 30 cm")
    .max(55, "Shoulder width must be at most 55 cm")
    .optional(),
  footLengthMm: z
    .number()
    .min(220, "Foot length must be at least 220 mm")
    .max(320, "Foot length must be at most 320 mm")
    .optional(),
});

// Step 3: Flexibility assessment
export const flexibilitySchema = z.object({
  flexibilityScore: z.enum([
    "very_limited",
    "limited",
    "average",
    "good",
    "excellent",
  ]),
});

// Step 4: Core stability assessment
export const coreStabilitySchema = z.object({
  coreStabilityScore: z.number().min(1).max(5),
});

// Step 5: Riding preferences
export const ridingPreferencesSchema = z.object({
  bikeType: z.enum(["road", "gravel", "mtb", "city"]),
  ridingStyle: z.enum([
    "recreational",
    "fitness",
    "sportive",
    "racing",
    "commuting",
    "touring",
  ]),
  primaryGoal: z.enum(["comfort", "balanced", "performance", "aero"]),
});

// Step 6: Optional current setup
export const currentSetupSchema = z.object({
  currentSaddleHeightMm: z.number().min(500).max(900).optional(),
  currentSetbackMm: z.number().min(-20).max(100).optional(),
  currentDropMm: z.number().min(-100).max(200).optional(),
  currentStemLengthMm: z.number().min(50).max(150).optional(),
  currentCrankLengthMm: z.number().min(160).max(180).optional(),
});

// Complete profile schema
export const profileSchema = z.object({
  ...bodyMeasurementsSchema.shape,
  ...advancedMeasurementsSchema.shape,
  ...flexibilitySchema.shape,
  coreStabilityScore: z.number().min(1).max(5),
  age: z.number().min(10).max(100).optional(),
  weightKg: z.number().min(30).max(200).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Flexibility test descriptions
export const flexibilityTests = [
  {
    score: "very_limited" as const,
    label: "Very Limited",
    description: "Cannot reach knees when seated with legs straight",
    testResult: "Fingertips stop before knees",
  },
  {
    score: "limited" as const,
    label: "Limited",
    description: "Can reach mid-shin when seated",
    testResult: "Reach mid-shin",
  },
  {
    score: "average" as const,
    label: "Average",
    description: "Can reach ankles when seated",
    testResult: "Reach ankles",
  },
  {
    score: "good" as const,
    label: "Good",
    description: "Can reach toes when seated",
    testResult: "Reach toes",
  },
  {
    score: "excellent" as const,
    label: "Excellent",
    description: "Can reach past toes when seated",
    testResult: "Hands past toes",
  },
];

// Core stability test descriptions
export const coreStabilityTests = [
  {
    score: 1,
    label: "Very Low",
    description: "Plank hold less than 20 seconds",
  },
  {
    score: 2,
    label: "Low",
    description: "Plank hold 20-40 seconds",
  },
  {
    score: 3,
    label: "Average",
    description: "Plank hold 40-60 seconds",
  },
  {
    score: 4,
    label: "Good",
    description: "Plank hold 60-90 seconds",
  },
  {
    score: 5,
    label: "Excellent",
    description: "Plank hold 90+ seconds with perfect form",
  },
];
