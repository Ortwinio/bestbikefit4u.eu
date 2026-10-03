import { PROFILE_RANGES } from "../profileBounds";
import { ageFromBirthDate } from "../riderDemographics";
import { FLEXIBILITY_REFERENCE_STATUS, FLEXIBILITY_SOURCES } from "./sourcesFlexibility";
import type { EstimateInput, EstimateResult } from "./types";

export function estimateFlexibility(input: EstimateInput, now: number): EstimateResult<NonNullable<EstimateInput["flexibilityScore"]>> {
  const unavailable = (reason: "existing_value" | "missing_inputs" | "invalid_inputs" | "sex_not_provided") =>
    ({ status: "unavailable", reason, sources: FLEXIBILITY_SOURCES } as const);
  if (input.flexibilityScore !== undefined) return unavailable("existing_value");
  if (!Number.isFinite(now)) return unavailable("invalid_inputs");
  if (input.birthDate === undefined) return unavailable("missing_inputs");
  const age = ageFromBirthDate(input.birthDate, now);
  if (age === null || age < PROFILE_RANGES.age[0] || age > PROFILE_RANGES.age[1]) return unavailable("invalid_inputs");
  if (input.sex === undefined || input.sex === "prefer_not_to_say") return unavailable("sex_not_provided");
  if (input.sex !== "female" && input.sex !== "male") return unavailable("invalid_inputs");
  return { status: "unavailable", reason: "unsupported_reference",
    placeholder: FLEXIBILITY_REFERENCE_STATUS.placeholder, sources: FLEXIBILITY_SOURCES };
}
