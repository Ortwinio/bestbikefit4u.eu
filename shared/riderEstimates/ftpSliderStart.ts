import type { RiderSex } from "../riderDemographics";

export const FTP_SLIDER_REFERENCE = {
  source: "https://www8.garmin.com/manuals-apac/webhelp/fenix7series/EN-SG/GUID-6C0F3C49-1E05-4AE5-8EC0-367A47C07DAB-4498.html",
  attribution: "Allen and Coggan, Training and Racing with a Power Meter (2010), via Garmin FTP Ratings",
  category: "Fair",
  wattsPerKg: { male: { min: 2.23, max: 2.78 }, female: { min: 1.9, max: 2.35 } },
  choice: "Lower boundary of the lowest bounded category; UI starting position only, not predicted FTP.",
} as const;

export function getFtpSliderStart({ sex, weightKg, knownFtpWatts, min, max, step }: {
  sex?: RiderSex | null;
  weightKg?: number | null;
  knownFtpWatts?: number | null;
  min: number;
  max: number;
  step: number;
}): number | null {
  if (typeof knownFtpWatts === "number" && Number.isFinite(knownFtpWatts) && knownFtpWatts > 0) return null;
  if (sex !== "male" && sex !== "female") return null;
  if (typeof weightKg !== "number" || !Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (![min, max, step].every(Number.isFinite) || step <= 0 || max < min) return null;
  const boundary = FTP_SLIDER_REFERENCE.wattsPerKg[sex].min * weightKg;
  const start = Number((min + Math.round((boundary - min) / step) * step).toFixed(8));
  return start >= min && start <= max ? start : null;
}
