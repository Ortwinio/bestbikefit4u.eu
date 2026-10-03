import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { isPaidAccessEnforced } from "../../shared/pricing/flags";
import { getUserAccess } from "../pricing/access";

export const PAID_PROFILE_FIELDS = [
  "femurLengthCm", "footLengthCm", "sitBoneWidthMm", "handSpanCm", "flexibilityTestCm", "coreTestSeconds",
] as const;

export async function assertPaidProfileWrite(
  ctx: MutationCtx, userId: Id<"users">, updates: Record<string, unknown>,
  previous: Doc<"profiles"> | null, confirm = false,
) {
  if (!isPaidAccessEnforced()) return;
  const changed = PAID_PROFILE_FIELDS.some(field => updates[field] !== undefined && updates[field] !== null
    && (confirm || updates[field] !== previous?.[field]));
  if (changed && !(await getUserAccess(ctx, userId)).fullProfile) throw new Error("PAID_PROFILE_ACCESS_REQUIRED");
}
