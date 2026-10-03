import { v } from "convex/values";

export const adviceSourceValidator = v.union(v.literal("recommendations"), v.literal("saddleWidthSessions"),
  v.literal("gearingSessions"), v.literal("pressureCalculations"), v.literal("calculatorStates"));
export const adviceFeedbackResult = v.union(v.literal("better"), v.literal("same"), v.literal("worse"));
export const adviceProgressValidator = v.array(v.object({ key: v.string(), performedAt: v.number(), note: v.optional(v.string()),
  feedback: v.optional(v.object({ result: adviceFeedbackResult, note: v.optional(v.string()), recordedAt: v.number(),
    rideFeedbackId: v.optional(v.id("rideFeedbackEntries")) })) }));

export const inputProvenanceValidator = v.object({
  version: v.literal(1),
  capturedAt: v.number(),
  dependencies: v.array(v.object({
    field: v.string(),
    bikeId: v.optional(v.id("bikes")),
    value: v.union(v.number(), v.string(), v.boolean(), v.array(v.string()), v.array(v.number()), v.null()),
    observationId: v.optional(v.id("profileObservations")),
    record: v.optional(v.union(
      v.object({ table: v.literal("tireSetups"), id: v.id("tireSetups") }),
      v.object({ table: v.literal("wheelsets"), id: v.id("wheelsets") }),
    )),
  })),
});
