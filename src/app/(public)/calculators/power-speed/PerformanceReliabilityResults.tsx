import type { Locale } from "@/i18n/config";
import { reliabilityPerformance } from "@/i18n/calculators/reliabilityPerformance";
import { performanceMessages } from "@/i18n/calculators/performance";
import { ReliabilityResultRows, type ReliabilityResultRow } from "@/components/reliability/ReliabilityResultRows";
import { getReliabilityRange } from "../../../../../shared/reliability/calculators";
import { calculateClimbingCadence, calculateFluidLoss } from "../../../../../shared/reliability/performance";
import { bikeDefaults, climbPlan, ftpEstimate, powerAtSpeed, speedAtPower, type FtpMethod, type RidingConditions } from "@/lib/public-calculators/performance";
import type { HandoffField } from "@/lib/handoff/store";
import type { PerformanceNumericField, PublicPerformanceTool } from "./usePerformanceInputs";

export interface PerformanceReliabilityResultsProps {
  tool: PublicPerformanceTool;
  locale: Locale;
  mode: "power" | "speed";
  method: FtpMethod;
  bike: "road" | "gravel" | "mtb" | "city";
  intensity: "easy" | "endurance" | "tempo" | "race";
  number: (field: PerformanceNumericField) => number;
  has: (field: HandoffField) => boolean;
}

export function PerformanceReliabilityResults({ tool, locale, mode, method, bike, intensity, number, has }: PerformanceReliabilityResultsProps) {
  const copy = reliabilityPerformance[locale];
  const format = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const rows: ReliabilityResultRow[] = [];
  let supplement = null;
  let caption = "";
  if (tool === "power-speed") {
    const engineBike = bike === "mtb" ? "mountain" : bike;
    const conditions: RidingConditions = { riderMassKg: number("weightKg"), bikeMassKg: 9, bike: engineBike,
      surface: bikeDefaults(engineBike).surface, gradientPct: 0 };
    const result = speedAtPower(conditions, number("powerWatts"));
    const speed = mode === "power" ? result.speedKmh : number("speedKph");
    const range = getReliabilityRange({ metric: "speed", value: speed });
    if (range && (mode === "speed" || !result.limit)) rows.push({ label: copy.speedTool.result, unit: copy.kmh, range,
      basis: `${copy.speedTool.basis}; ${copy.bikes[bike]}, ${format(number("weightKg"))} kg${has("weightKg") ? "" : ` (${copy.assumed})`}` });
    caption = copy.speedTool.what;
    if (mode === "speed") supplement = <div className="mb-4"><h2 className="font-semibold">{copy.speedTool.reverseResult}</h2>
      <p className="my-2 font-mono text-3xl">{format(powerAtSpeed(conditions, speed))} W</p></div>;
    else if (result.limit) supplement = <p role="status">{performanceMessages[locale].capped}</p>;
  } else if (tool === "climb-planner") {
    const result = climbPlan({ distanceKm: number("distanceKm"), gradientPct: number("gradientPercent"),
      ftpWatts: number("ftpWatts"), riderMassKg: number("weightKg"), bike: "road" });
    const range = result.minutes === null ? null : getReliabilityRange({ metric: "climbTime", value: result.minutes });
    if (range) rows.push({ label: copy.climbTool.result, unit: "min", range,
      basis: `FTP ${format(number("ftpWatts"))} W${has("ftpWatts") ? "" : ` (${copy.assumed})`}, ${format(number("weightKg"))} kg${has("weightKg") ? "" : ` (${copy.assumed})`}; ${copy.bikes.road} ${format(bikeDefaults("road").bikeMassKg)} kg` });
    else supplement = <p role="status">{performanceMessages[locale].capped}</p>;
    caption = `${format(result.multiplier * 100)}% FTP`;
  } else if (tool === "ftp-wkg") {
    const result = ftpEstimate(method, number(method === "known" ? "ftpWatts" : method === "ramp" ? "rampWatts" : "twentyMinuteWatts"), number("weightKg"));
    const evidence = { ftpMethod: method === "twentyMinute" ? "twenty-minute" as const : method === "ramp" ? "ramp" as const : undefined };
    const powerRange = getReliabilityRange({ metric: "ftpPower", value: result.ftpWatts, evidence });
    if (powerRange) rows.push({ label: copy.ftpTool.result, unit: "W", range: powerRange, basis: copy.ftpTool.basis[method] });
    if (has("weightKg")) {
      const range = getReliabilityRange({ metric: "ftpWkg", value: result.wattsPerKg,
        evidence });
      if (range) rows.push({ label: copy.ftpTool.wkg, unit: "W/kg", range,
        basis: `${copy.ftpTool.basis[method]}, ${format(number("weightKg"))} kg` });
    } else caption = copy.weightNeeded;
  } else if (tool === "gearing") {
    const result = calculateClimbingCadence({ chainringTeeth: number("innerChainringTeeth"), rearCogTeeth: number("cassetteLargestCogTeeth"),
      gradientPct: has("gradientPercent") ? number("gradientPercent") : undefined,
      riderWeightKg: has("weightKg") ? number("weightKg") : undefined,
      ftpWatts: has("ftpWatts") ? number("ftpWatts") : undefined });
    const range = result.limit ? null : getReliabilityRange({ metric: "cadence", value: result.cadenceRpm });
    if (range) rows.push({ label: copy.gearingTool.result, unit: "rpm", range,
      basis: `${result.ftpEstimated ? copy.gearingTool.basis : copy.gearingTool.knownBasis}; FTP ${format(result.ftpWatts)} W; ${format(result.riderWeightKg)} kg${result.weightAssumed ? ` (${copy.assumed})` : ""}` });
    else supplement = <p role="status">{performanceMessages[locale].capped}</p>;
    caption = `${copy.gearingTool.what}, ${format(result.gradientPct)}%${result.gradientAssumed ? ` (${copy.assumed})` : ""}`;
  } else {
    const result = calculateFluidLoss({ durationHours: number("durationMinutes") / 60, effort: intensity,
      temperatureC: has("temperatureC") ? number("temperatureC") : undefined });
    const range = getReliabilityRange({ metric: "hydration", value: result.fluidLossMlPerHour });
    if (range) rows.push({ label: copy.fuelTool.result, unit: copy.mlh, range,
      basis: `${result.temperatureAssumed ? copy.fuelTool.initialBasis : copy.fuelTool.basis}; ${copy.efforts[intensity]}, ${format(result.temperatureC)} °C` });
    const carbs = result.carbohydrateGuideline;
    supplement = <article className="mb-5" data-carbohydrate-guideline=""><h2 className="font-semibold">{copy.carbs}</h2>
      <p className="my-2 font-mono text-3xl">{carbs.minGramsPerHour === carbs.maxGramsPerHour ? format(carbs.maxGramsPerHour)
        : `${format(carbs.minGramsPerHour)}–${format(carbs.maxGramsPerHour)}`} <span className="text-sm">g/{locale === "nl" ? "u" : "h"}</span></p>
      <p className="text-sm text-muted-foreground">{copy.guideline}</p></article>;
  }
  return <div id={`${tool}-result`}>
    {tool !== "fuel-hydration" && supplement}
    <ReliabilityResultRows locale={locale} rows={rows} />
    {tool === "fuel-hydration" && supplement}
    {caption && <p className="mb-4 text-sm text-muted-foreground">{caption}</p>}
  </div>;
}
