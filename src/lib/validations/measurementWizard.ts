import { z } from "zod";

export const wizardSchema = z.object({
  measurementKinds: z.object({
    heightCm: z.enum(["measured", "estimated"]).optional(),
    inseamCm: z.enum(["measured", "estimated"]).optional(),
    weightKg: z.enum(["measured", "estimated"]).optional(),
    torsoLengthCm: z.enum(["measured", "estimated"]).optional(),
    armLengthCm: z.enum(["measured", "estimated"]).optional(),
    femurLengthCm: z.enum(["measured", "estimated"]).optional(),
    shoulderWidthCm: z.enum(["measured", "estimated"]).optional(),
  }).optional(),
  // Step 1: Required body measurements
  heightCm: z.number().min(130).max(210),
  inseamCm: z.number().min(55).max(105),
  weightKg: z.number().min(30).max(200).optional(),

  // Step 2: Optional advanced measurements
  torsoLengthCm: z.number().min(45).max(75).optional(),
  armLengthCm: z.number().min(45).max(75).optional(),
  femurLengthCm: z.number().min(35).max(60).optional(),
  shoulderWidthCm: z.number().min(30).max(55).optional(),

  // Step 3: Flexibility
  flexibilityScore: z.enum([
    "very_limited",
    "limited",
    "average",
    "good",
    "excellent",
  ]),

  // Step 4: Core stability
  coreStabilityScore: z.number().min(1).max(5),

  // Step 5: Comfort
  comfortScore: z.number().min(1).max(5),
  painAreas: z.array(z.string()).optional(),

  // Step 6: Riding style
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  weeklyHours: z.enum(["0-3", "3-6", "6-10", "10-15", "15+"]).optional(),
  typicalRideLength: z.enum(["short", "medium", "long", "ultra"]).optional(),
  positionPriority: z.enum(["comfort", "balanced", "performance"]).optional(),
}).superRefine((data, ctx) => {
  // Keep later-step fields optional during parsing so their absence does not
  // suppress cross-field validation of discomfort on the earlier step.
  for (const field of ["experienceLevel", "weeklyHours", "typicalRideLength", "positionPriority"] as const) {
    if (!data[field]) {
      ctx.addIssue({ code: "custom", path: [field], message: "Choose an answer to complete your rider profile." });
    }
  }
  if (data.comfortScore < 5 && !data.painAreas?.length) {
    ctx.addIssue({
      code: "custom",
      path: ["painAreas"],
      message: "Select the areas where you experience discomfort.",
    });
  }
});

export type WizardFormData = z.infer<typeof wizardSchema>;
