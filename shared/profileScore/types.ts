export type ObservationKind = "measured" | "estimated" | "derived" | "declared";
export type ScoreLevel = "basic" | "building" | "strong" | "complete";
export type ScoreValue = number | string | boolean | readonly string[] | undefined | null;

export type ScoreObservation = {
  field: string;
  value?: number | string | readonly number[] | readonly string[];
  kind?: ObservationKind;
  method?: string;
  source?: string;
  recordedAt?: number;
  status?: "current" | "superseded";
  bikeId?: string;
  repeatCount?: number;
  withinTolerance?: boolean;
  measurePoint?: string;
  unresolvedWarning?: boolean;
};

export type ScoreRule = {
  key: string;
  group: string;
  weight: number;
  fields: readonly string[];
  body?: boolean;
  zeroAllowed?: boolean;
  sensitive?: boolean;
};

export type ScoreItem = {
  key: string;
  group: string;
  weight: number;
  complete: boolean;
  quality: number;
  freshness: number;
  completeness: number;
  reliability: number;
  gain: number;
  missingDate: boolean;
};

export type ProfileScore = {
  completeness: number;
  reliability: number;
  level: ScoreLevel;
  items: ScoreItem[];
  groups: Array<{ key: string; weight: number; completeness: number; reliability: number }>;
  nextStep: { key: string; group: string; gain: number; completenessGain: number } | null;
};

export type RiderValues = Partial<Record<
  "heightCm" | "inseamCm" | "torsoLengthCm" | "armLengthCm" | "shoulderWidthCm" |
  "femurLengthCm" | "sitBoneWidthMm" | "weightKg" | "ftpWatts" | "coreStabilityScore" |
  "shoeSizeEu" | "age" | "weightUpdatedAt" | "ftpMeasuredAt", number
>> & Partial<Record<
  "flexibilityScore" | "experienceLevel" | "weeklyHours" | "typicalRideLength" |
  "hasPain" | "positionPriority" | "cleatSystem", string
>> & { painAreas?: string[] };

export type BikeValues = {
  _id?: string;
  bikeType?: string;
  brand?: string;
  model?: string;
  year?: number;
  primaryGoal?: string;
  saddleModel?: string;
  saddleWidthMm?: number;
  cleatSystem?: string;
  pedalModel?: string;
  maxSeatpostMm?: number;
  maxSpacerStackMm?: number;
  currentSetup?: Partial<Record<
    "saddleHeightMm" | "saddleSetbackMm" | "handlebarReachMm" | "handlebarDropMm" |
    "stemLengthMm" | "stemAngle" | "handlebarWidthMm" | "spacersMm" | "crankLengthMm", number
  >> & { saddleHeightMeasurement?: { measurePoint: string; measuredAt: number; source: string } };
  currentGeometry?: { stackMm?: number; reachMm?: number; seatTubeAngle?: number; headTubeAngle?: number; frameSize?: string };
  gearing?: { chainrings?: number[]; cassetteTeeth?: number[]; wheelCircumferenceMm?: number };
  tires?: { widthFrontMm?: number; widthRearMm?: number; tubeType?: string };
};
