type CalcLike = {
  createdAt?: number;
  _creationTime?: number;
} | null;

type ProfileLike = {
  weightUpdatedAt?: number;
} | null;

type PressureInputLike = {
  updatedAt?: number;
} | null;

export function isPressureStale(
  calc: CalcLike,
  profile: ProfileLike,
  pressureInput: PressureInputLike
) {
  if (!calc) {
    return false;
  }

  const calcAt = calc.createdAt ?? calc._creationTime ?? 0;

  if (profile?.weightUpdatedAt && profile.weightUpdatedAt > calcAt) {
    return true;
  }

  if (pressureInput?.updatedAt && pressureInput.updatedAt > calcAt) {
    return true;
  }

  return false;
}
