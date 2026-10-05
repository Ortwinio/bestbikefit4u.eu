import { v, type Infer } from "convex/values";

export const calculatorInput = v.object({
  field: v.string(), value: v.union(v.number(), v.string()), unit: v.string(), calculator: v.string(),
  method: v.union(v.literal("measured"), v.literal("estimated"), v.literal("declared"), v.literal("bike")), touchedAt: v.number(),
  measurementMethod: v.optional(v.string()),
  kind: v.optional(v.union(v.literal("measured"), v.literal("declared"), v.literal("estimated"), v.literal("derived"))),
  repeatCount: v.optional(v.number()), withinTolerance: v.optional(v.boolean()),
  unresolvedWarning: v.optional(v.boolean()),
});
export type CalculatorInput = Infer<typeof calculatorInput>;
