import type { Doc } from "../../convex/_generated/dataModel";

/**
 * Returns true when all required rider profile questions have been answered.
 * painAreas must be non-empty when hasPain === "yes".
 */
export function isRiderProfileComplete(
  profile: Doc<"profiles"> | null | undefined
): boolean {
  if (!profile) return false;
  return (
    !!profile.experienceLevel &&
    !!profile.weeklyHours &&
    !!profile.typicalRideLength &&
    !!profile.hasPain &&
    !!profile.positionPriority &&
    (profile.hasPain !== "yes" || (profile.painAreas?.length ?? 0) > 0)
  );
}
