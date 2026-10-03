import type { Doc } from "../../../../convex/_generated/dataModel";
import type { GearingCalculatorInput } from "@/app/(public)/calculators/gearing/gearing-engine";
import { DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE } from "@/app/(public)/calculators/gearing/gearing-engine";

type SavedInput = Doc<"gearingSessions">["input"];
type Bike = Pick<Doc<"bikes">, "gearing" | "bikeType" | "bikeWeightKg" | "currentSetup">;

export function buildGearingPrefill(saved?: SavedInput, bike?: Bike | null): GearingCalculatorInput {
  const gearing = bike?.gearing;
  const kind = bike?.bikeType ?? saved?.bikeType;
  const bikeType = kind === "mountain" ? "mtb" : kind === "gravel" || kind === "cyclocross" ? "gravel"
    : kind === "city" || kind === "hybrid" || kind === "touring" ? "commuter" : "road";
  const rings = gearing?.chainrings ?? saved?.chainrings;
  const cassette = gearing?.cassetteTeeth ?? saved?.cassetteTeeth;
  return {
    drivetrainType: gearing?.drivetrainType ?? saved?.drivetrainType ?? "2x",
    bikeType,
    climbBand: saved?.climbLengthBand ?? "medium",
    outerChainringTeeth: rings?.length ? Math.max(...rings) : 50,
    innerChainringTeeth: rings && rings.length > 1 ? Math.min(...rings) : 34,
    cassetteSmallestCogTeeth: cassette?.length ? Math.min(...cassette) : 11,
    cassetteLargestCogTeeth: cassette?.length ? Math.max(...cassette) : 34,
    wheelCircumferenceMm: gearing?.wheelCircumferenceMm ?? saved?.wheelCircumferenceMm
      ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE[bikeType],
    cadenceRpm: saved?.cadenceRpm ?? saved?.preferredCadenceRpm ?? 80,
    gradientPct: saved?.climbGradientPct ?? 8,
  };
}

export function buildGearingPersistence(values: GearingCalculatorInput, saved?: SavedInput, bike?: Bike | null): SavedInput {
  const cassette = bike?.gearing?.cassetteTeeth ?? saved?.cassetteTeeth;
  const preserveCassette = cassette?.length && Math.min(...cassette) === values.cassetteSmallestCogTeeth
    && Math.max(...cassette) === values.cassetteLargestCogTeeth;
  return {
    ...saved,
    groupsetName: bike?.gearing?.groupsetName ?? saved?.groupsetName,
    rearDerailleurMaxCog: bike?.gearing?.derailleurMaxCog ?? saved?.rearDerailleurMaxCog,
    crankLengthMm: bike?.currentSetup?.crankLengthMm ?? saved?.crankLengthMm,
    drivetrainType: values.drivetrainType,
    chainrings: [values.outerChainringTeeth, ...(values.drivetrainType === "2x" ? [values.innerChainringTeeth] : [])]
      .filter((value): value is number => value !== undefined),
    cassetteTeeth: preserveCassette ? cassette : [values.cassetteSmallestCogTeeth!, values.cassetteLargestCogTeeth!],
    wheelCircumferenceMm: values.wheelCircumferenceMm!,
    cadenceRpm: values.cadenceRpm,
    preferredCadenceRpm: values.cadenceRpm,
    climbGradientPct: values.gradientPct,
    climbLengthBand: values.climbBand,
    bikeType: values.bikeType === "mtb" ? "mountain" : values.bikeType === "commuter" ? "city" : values.bikeType,
  };
}
