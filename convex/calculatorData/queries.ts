import { query, type QueryCtx } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import type { Id } from "../_generated/dataModel";
import { readProfileProvenance } from "../profiles/provenance";
import { HANDOFF_FIELD_UNITS } from "../../src/lib/handoff/store";
import { profileField, shouldReplace } from "./merge";
import type { CalculatorInput } from "./validators";
import { calculatorDataKey } from "../../shared/calculatorDataScope";

export async function readCalculatorInputs(ctx: Pick<QueryCtx, "db">, userId: Id<"users">) {
  const { profile, observations } = await readProfileProvenance(ctx, userId);
  const entries = new Map<string, CalculatorInput>((profile?.calculatorInputs ?? []).map(entry => [calculatorDataKey(entry), entry]));
  for (const [field, unit] of Object.entries(HANDOFF_FIELD_UNITS)) {
    const observation = observations.find(candidate => candidate.field === profileField(field));
    if (!observation || Array.isArray(observation.value)) continue;
    const value = field === "flexibilityScore" && typeof observation.value === "string"
      ? ["very_limited", "limited", "average", "good", "excellent"].indexOf(observation.value) + 1 : observation.value;
    const entry: CalculatorInput = { field, value, unit, calculator: "bike-fit",
      method: observation.kind === "measured" ? "measured" : observation.kind === "estimated" ? "estimated" : "declared",
      measurementMethod: observation.method,
      kind: observation.kind, touchedAt: observation.recordedAt,
      ...("repeatCount" in observation ? { repeatCount: observation.repeatCount } : {}),
      ...("withinTolerance" in observation ? { withinTolerance: observation.withinTolerance } : {}),
      ...("unresolvedWarning" in observation ? { unresolvedWarning: observation.unresolvedWarning } : {}) };
    if (entries.get(field)?.value === value && entries.get(field)?.touchedAt === entry.touchedAt) {
      entries.set(field, { ...entries.get(field)!, ...entry });
      continue;
    }
    if (entries.get(field)?.value !== value || shouldReplace(entries.get(field), entry)) entries.set(field, entry);
  }
  return { profile, entries: [...entries.values()] };
}

export const get = query({
  args: {},
  handler: async ctx => {
    const userId = await requireUserId(ctx);
    const { entries } = await readCalculatorInputs(ctx, userId);
    return { userId, entries };
  },
});
