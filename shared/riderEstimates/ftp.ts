import { PROFILE_RANGES } from "../profileBounds";
import { ageFromBirthDate } from "../riderDemographics";
import { FTP_DEMOGRAPHIC_MODEL, FTP_ESTIMATE_EVIDENCE } from "./sourcesFtp";
import type { EstimateInput, EstimateResult } from "./types";

export function estimateFtp(input: EstimateInput, now: number): EstimateResult<number> {
  const sources = FTP_ESTIMATE_EVIDENCE;
  if (input.ftpWatts !== undefined) return { status: "unavailable", reason: "existing_value", sources };
  if (!input.sex || input.sex === "prefer_not_to_say") {
    return { status: "unavailable", reason: "sex_not_provided", sources };
  }
  if (input.birthDate === undefined || input.weightKg === undefined) {
    return { status: "unavailable", reason: "missing_inputs", sources };
  }
  const age = ageFromBirthDate(input.birthDate, now);
  if ((input.sex !== "male" && input.sex !== "female") || age === null ||
    age < PROFILE_RANGES.age[0] || age > PROFILE_RANGES.age[1] ||
    !Number.isFinite(input.weightKg) || input.weightKg < PROFILE_RANGES.weightKg[0] ||
    input.weightKg > PROFILE_RANGES.weightKg[1]) {
    return { status: "unavailable", reason: "invalid_inputs", sources };
  }
  return { status: "unavailable", reason: "unsupported_reference", sources,
    placeholder: FTP_DEMOGRAPHIC_MODEL.placeholder };
}
