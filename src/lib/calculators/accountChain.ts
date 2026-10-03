import type { CalculatorId, CalculatorValues } from "../../../convex/calculatorStates/validators";
import type { CalculatorBike, CalculatorProfile } from "./accountState";
import { equalChainValues, type ChainBinding, type ChainKind, type ChainValue } from "./chain";

export interface ChainObservation {
  field: string; value: ChainValue; kind: ChainKind; recordedAt?: number; measurePoint?: "bb_center_to_saddle_top";
}
const scores = ["very_limited", "limited", "average", "good", "excellent"];
const nested = (object: unknown, path: string): unknown => path.split(".").reduce<unknown>((value, key) =>
  value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, object);
function setPath<T>(values: T, path: string, value: unknown): T {
  const [first, second] = path.split(".");
  return { ...values, [first]: second
    ? { ...(nested(values, first) as object), [second]: value } : value };
}
export function accountChainBindings<K extends CalculatorId>(
  calculator: K, profile: CalculatorProfile | null | undefined, bike: CalculatorBike | null | undefined,
  observations: ChainObservation[] = [], bikeObservations: ChainObservation[] = [],
): ChainBinding<CalculatorValues<K>>[] {
  const result: ChainBinding<CalculatorValues<K>>[] = [];
  function bind(
    path: string, field: string, source: "profile" | "bike", unit: string,
    fromForm: (value: unknown) => ChainValue = value => value as ChainValue,
    toForm: (value: ChainValue) => unknown = value => value,
  ) {
    const value = nested(source === "profile" ? profile : bike, field) as ChainValue | undefined;
    const evidence = (source === "profile" ? observations : bikeObservations)
      .find((item) => item.field === field && equalChainValues(item.value, value));
    result.push({ field, source, unit, value, kind: evidence?.kind ?? "declared",
      recordedAt: evidence?.recordedAt, measurePoint: evidence?.measurePoint,
      read: values => {
        const current = nested(values, path);
        return current === undefined ? undefined : fromForm(current);
      },
      write: (values, next) => setPath(values, path, toForm(next)),
    });
  }
  if (["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"].includes(calculator)) {
    if (calculator !== "fuel-hydration") bind("values.riderMass", "weightKg", "profile", "kg");
    if (calculator === "climb-planner" || calculator === "ftp-wkg") {
      bind("values.ftp", "ftpWatts", "profile", "W");
    }
    if (calculator === "ftp-wkg") {
      const ftpBinding = result.find((binding) => binding.field === "ftpWatts")!;
      const readFtp = ftpBinding.read;
      ftpBinding.read = values => "method" in values && values.method !== "known" ? undefined : readFtp(values);
    }
    if (bike && calculator !== "fuel-hydration" && calculator !== "ftp-wkg") {
      bind("values.bikeMass", "bikeWeightKg", "bike", "kg");
      bind("bike", "bikeType", "bike", "none");
    }
    if (calculator === "fuel-hydration") bind("sweat", "sweatProfile", "profile", "none");
    return result;
  }
  bind("inseamCm", "inseamCm", "profile", "cm");
  if (bike) bind("category", "bikeType", "bike", "none", value => value === "mtb" ? "mountain" : value as string,
    value => value === "mountain" ? "mtb" : value);
  if (calculator === "frame-size" || calculator === "bike-fit") bind("heightCm", "heightCm", "profile", "cm");
  if (calculator === "saddle-height" || calculator === "bike-fit") {
    bind("flexibility", "flexibilityScore", "profile", "score", value => scores[Number(value) - 1],
      value => scores.indexOf(String(value)) + 1);
    bind("core", "coreStabilityScore", "profile", "score");
    if (bike) bind("ambition", "primaryGoal", "bike", "none", value => value === "aero" ? "aerodynamics" : value as string,
      value => value === "aerodynamics" ? "aero" : value);
    else bind("ambition", "positionPriority", "profile", "none", value => value === "aero" ? "performance" : value as string);
  }
  if (bike && calculator === "saddle-height") bind("current", "currentSetup.saddleHeightMm", "bike", "mm");
  return result;
}
