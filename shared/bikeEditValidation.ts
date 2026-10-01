/** Existing bike editor ranges. Unchanged legacy measurements are preserved, never clamped. */
export const bikeEditRanges = {
  currentGeometry: {
    stackMm: [200, 900],
    reachMm: [200, 600],
    seatTubeAngle: [50, 90],
    headTubeAngle: [50, 90],
  },
  currentSetup: {
    saddleHeightMm: [400, 1000],
    saddleSetbackMm: [-100, 200],
    stemLengthMm: [20, 200],
    stemAngle: [-45, 45],
    handlebarWidthMm: [300, 900],
    crankLengthMm: [120, 220],
  },
  gearing: { wheelCircumferenceMm: [1000, 3000], crankLengthMm: [120, 220], derailleurMaxCog: [10, 60] },
} as const;

type Editable = {
  bikeWeightKg?: number;
  name?: string;
  notes?: string;
  brand?: string;
  model?: string;
  currentGeometry?: object;
  currentSetup?: object;
  gearing?: object;
};
export function bikeEditError(
  next: Editable,
  previous: Editable = {},
): "required" | "length" | "invalid" | null {
  if (
    next.bikeWeightKg !== undefined &&
    next.bikeWeightKg !== previous.bikeWeightKg &&
    (!Number.isFinite(next.bikeWeightKg) || next.bikeWeightKg < 3 || next.bikeWeightKg > 20)
  )
    return "invalid";
  if (next.name !== undefined && !next.name.trim()) return "required";
  for (const key of ["name", "brand", "model"] as const) {
    if ((next[key]?.length ?? 0) > 100) return "length";
  }
  if ((next.notes?.length ?? 0) > 500) return "length";
  for (const group of Object.keys(bikeEditRanges) as (keyof typeof bikeEditRanges)[]) {
    const values = next[group] as Record<string, unknown> | undefined;
    const old = previous[group] as Record<string, unknown> | undefined;
    for (const [key, [min, max]] of Object.entries(bikeEditRanges[group])) {
      const value = values?.[key];
      if (value === undefined || value === old?.[key]) continue;
      if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max)
        return "invalid";
    }
  }
  const gearing = next.gearing as { chainrings?: number[]; cassetteTeeth?: number[] } | undefined;
  for (const key of ["chainrings", "cassetteTeeth"] as const) {
    if (gearing?.[key]?.some((value) => !Number.isInteger(value) || value <= 0)) return "invalid";
  }
  return null;
}
