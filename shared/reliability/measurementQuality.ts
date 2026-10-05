import { PROFILE_RANGES } from "../profileBounds";
import { checkInseamPlausibility } from "./saddleHeight";

/** Metadata for a real saved value. Confirmation never clears a large deviation. */
export function getInseamObservationQuality(input: {
  heightCm?: number;
  inseamCm: number;
  confirmed?: boolean;
  repeatCount?: number;
  withinTolerance?: boolean;
}) {
  const [min, max] = PROFILE_RANGES.inseamCm;
  if (!Number.isFinite(input.inseamCm) || input.inseamCm < min || input.inseamCm > max) {
    throw new RangeError("Invalid inseam");
  }
  const check = input.heightCm === undefined ? null
    : checkInseamPlausibility(input.heightCm, input.inseamCm);
  if (check?.status === "error") throw new RangeError("Invalid height or inseam");
  const count = input.repeatCount ?? 1;
  if (!Number.isInteger(count) || count < 1) throw new RangeError("Invalid measurement count");
  return {
    unresolvedWarning: check?.status === "large" || (check?.status === "check" && !input.confirmed),
    repeatCount: Math.min(count, 3),
    withinTolerance: count >= 2 && input.withinTolerance === true,
  };
}
