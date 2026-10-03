type FitProfile = {
  heightCm?: number;
  inseamCm?: number;
  flexibilityScore?: "very_limited" | "limited" | "average" | "good" | "excellent";
  coreStabilityScore?: number;
};

export function hasFitMeasurements<Profile extends FitProfile>(
  profile: Profile | null | undefined,
): profile is Profile & Required<FitProfile> {
  return !!profile
    && profile.heightCm !== undefined && Number.isFinite(profile.heightCm) && profile.heightCm > 0
    && profile.inseamCm !== undefined && Number.isFinite(profile.inseamCm) && profile.inseamCm > 0
    && profile.flexibilityScore !== undefined
    && profile.coreStabilityScore !== undefined && Number.isInteger(profile.coreStabilityScore)
    && profile.coreStabilityScore >= 1 && profile.coreStabilityScore <= 5;
}
