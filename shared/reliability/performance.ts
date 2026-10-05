/** New public centre adapters from Calculator.dc.html; existing performance engines are unchanged. */
export interface ClimbingCadenceInput {
  chainringTeeth: number;
  rearCogTeeth: number;
  gradientPct?: number;
  riderWeightKg?: number;
  ftpWatts?: number;
  wheelCircumferenceM?: number;
}
function finiteRange(value: number, min: number, max: number, name: string) {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`Invalid ${name}`);
  return value;
}
export function calculateClimbingCadence(input: ClimbingCadenceInput) {
  const chainring = finiteRange(input.chainringTeeth, 1, 100, "chainring");
  const cog = finiteRange(input.rearCogTeeth, 1, 100, "rear cog");
  if (!Number.isInteger(chainring) || !Number.isInteger(cog)) throw new RangeError("Invalid tooth count");
  const gradientPct = finiteRange(input.gradientPct ?? 10, 0, 30, "gradient");
  const riderWeightKg = finiteRange(input.riderWeightKg ?? 75, 30, 200, "weight");
  const wheelCircumferenceM = finiteRange(input.wheelCircumferenceM ?? 2.1, 1.2, 2.8, "wheel circumference");
  const ftpWatts = finiteRange(input.ftpWatts ?? 3 * riderWeightKg, 1, 1200, "FTP");
  const climbingPowerWatts = 0.85 * ftpWatts;
  const theta = Math.atan(gradientPct / 100);
  const requiredPower = (speed: number) => (
    (riderWeightKg + 9) * 9.81 * (0.004 * Math.cos(theta) + Math.sin(theta)) * speed
    + 0.5 * 1.225 * 0.38 * speed ** 3
  ) / 0.975;
  // Same bounded bisection and explicit assumptions as the approved new cadence board.
  let low = 0.1, high = 30;
  for (let index = 0; index < 60; index++) {
    const middle = (low + high) / 2;
    if (requiredPower(middle) > climbingPowerWatts) high = middle;
    else low = middle;
  }
  const speedMps = (low + high) / 2;
  const developmentM = wheelCircumferenceM * chainring / cog;
  return {
    cadenceRpm: speedMps * 60 / developmentM, speedKmh: speedMps * 3.6, developmentM,
    climbingPowerWatts, ftpWatts, riderWeightKg, gradientPct,
    ftpEstimated: input.ftpWatts === undefined,
    weightAssumed: input.riderWeightKg === undefined,
    gradientAssumed: input.gradientPct === undefined,
    wheelCircumferenceAssumed: input.wheelCircumferenceM === undefined,
    limit: climbingPowerWatts < requiredPower(0.1) ? "below" as const
      : climbingPowerWatts > requiredPower(30) ? "above" as const : null,
  };
}
export interface FluidLossInput {
  durationHours: number;
  effort: "easy" | "endurance" | "tempo" | "race";
  temperatureC?: number;
}
/** Estimated sweat/fluid loss, not a prescription to replace every millilitre. Carbs are a guideline, not a CI. */
export function calculateFluidLoss(input: FluidLossInput) {
  const durationHours = finiteRange(input.durationHours, 0.25, 24, "duration");
  const temperatureC = finiteRange(input.temperatureC ?? 20, -20, 50, "temperature");
  const base = { easy: 350, endurance: 500, tempo: 700, race: 900 }[input.effort];
  if (base === undefined) throw new RangeError("Invalid effort");
  const fluidLossMlPerHour = Math.round(base * Math.max(0.6, 1 + 0.03 * (temperatureC - 20)) / 10) * 10;
  const carbohydrateGuideline = durationHours < 1.25 ? { minGramsPerHour: 30, maxGramsPerHour: 30 }
    : durationHours < 2.5 ? { minGramsPerHour: 30, maxGramsPerHour: 60 }
      : { minGramsPerHour: 60, maxGramsPerHour: 90 };
  return { fluidLossMlPerHour, carbohydrateGuideline, temperatureC, temperatureAssumed: input.temperatureC === undefined };
}
