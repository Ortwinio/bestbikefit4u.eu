export type BikeType =
  | "road"
  | "gravel"
  | "mountain"
  | "hybrid"
  | "tt_triathlon"
  | "cyclocross"
  | "touring"
  | "city";

export type StravaBikeImportCandidate = {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  distanceMeters?: number;
  primary?: boolean;
  bikeType?: BikeType;
  ambiguous?: boolean;
  matchedBikeId?: string;
};

export type StravaBikeImportParseResult = {
  candidates: StravaBikeImportCandidate[];
  parseError: boolean;
};

export type StravaBikeReadiness =
  | "available_in_strava"
  | "imported_needs_type_confirmation"
  | "imported_needs_fit_setup"
  | "fit_ready";

export type StravaBikeUsageSummary = {
  rideCount?: number;
  recentDistanceMeters?: number;
  avgRideDistanceMeters?: number;
  avgSpeedKph?: number;
  lastRideAt?: number;
  explanation?: string;
};

export type StravaBikeOverviewCandidate = StravaBikeImportCandidate & {
  imported: boolean;
  readiness: StravaBikeReadiness;
  usage: StravaBikeUsageSummary;
};

export type StravaBikeOverviewLocalBike = {
  _id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  stravaGearId?: string;
  bikeType?: BikeType;
  needsTypeConfirmation?: boolean;
  source?: string | null;
  bikeTypeSource?: string | null;
  currentGeometry?: {
    stackMm?: number;
    reachMm?: number;
    frameSize?: string;
  } | null;
  currentSetup?: {
    saddleHeightMm?: number;
    saddleSetbackMm?: number;
    stemLengthMm?: number;
    handlebarWidthMm?: number;
    crankLengthMm?: number;
  } | null;
  lifetimeDistanceMeters?: number;
  recentDistance90dMeters?: number;
  rideCount90d?: number;
  avgRideDistance90dMeters?: number;
  avgSpeed90dKph?: number;
  lastRideAt?: number;
  dominantSportType?: string | null;
  inferredBikeRole?: string | null;
  activitySummary?:
    | {
        recentDistance90dMeters?: number;
        rideCount?: number;
        totalDistanceKm?: number;
        averageDurationSec?: number;
        averageSpeedMps?: number;
        lastActivityAt?: number;
        inferredBikeRole?: string;
        dominantSportType?: string;
        lastActivityName?: string;
      }
    | null;
};

const allowedBikeTypes = new Set<BikeType>([
  "road",
  "gravel",
  "mountain",
  "hybrid",
  "tt_triathlon",
  "cyclocross",
  "touring",
  "city",
]);

function toStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

function toNumberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function hasFitGeometry(bike: {
  currentGeometry?: StravaBikeOverviewLocalBike["currentGeometry"];
}) {
  const geometry = bike.currentGeometry;
  return Boolean(
    geometry &&
      (geometry.stackMm !== undefined ||
        geometry.reachMm !== undefined ||
        geometry.frameSize)
  );
}

function hasFitSetup(bike: {
  currentSetup?: StravaBikeOverviewLocalBike["currentSetup"];
}) {
  const setup = bike.currentSetup;
  return Boolean(
    setup &&
      (setup.saddleHeightMm !== undefined ||
        setup.saddleSetbackMm !== undefined ||
        setup.stemLengthMm !== undefined ||
        setup.handlebarWidthMm !== undefined ||
        setup.crankLengthMm !== undefined)
  );
}

function mapFrameTypeToBikeType(frameType: number | undefined): BikeType | undefined {
  switch (frameType) {
    case 1:
      return "mountain";
    case 2:
      return "cyclocross";
    case 3:
      return "road";
    case 4:
      return "tt_triathlon";
    default:
      return undefined;
  }
}

function extractBikeType(value: unknown): BikeType | undefined {
  if (typeof value === "string" && allowedBikeTypes.has(value as BikeType)) {
    return value as BikeType;
  }
  return undefined;
}

function extractCandidate(raw: unknown, index: number): StravaBikeImportCandidate | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const name =
    toStringValue(candidate.name) ??
    toStringValue(candidate.title) ??
    toStringValue(candidate.nickname) ??
    toStringValue(candidate.gear_name) ??
    toStringValue(candidate.gearName);

  if (!name) {
    return null;
  }

  const id =
    toStringValue(candidate.id) ??
    toStringValue(candidate.gearId) ??
    toStringValue(candidate.gear_id) ??
    toStringValue(candidate.stravaGearId) ??
    toStringValue(candidate.externalId) ??
    `candidate-${index}`;

  const explicitBikeType =
    extractBikeType(candidate.bikeType) ??
    extractBikeType(candidate.bike_type) ??
    extractBikeType(candidate.type);
  const frameType = toNumberValue(candidate.frameType ?? candidate.frame_type);
  const frameTypeBikeType = mapFrameTypeToBikeType(frameType);
  const bikeType = explicitBikeType ?? frameTypeBikeType;
  const ambiguous = Boolean(
    candidate.ambiguous ??
      candidate.needsTypeConfirmation ??
      candidate.needs_type_confirmation ??
      (bikeType === undefined)
  );

  return {
    id,
    name,
    brand:
      toStringValue(candidate.brand) ??
      toStringValue(candidate.brand_name) ??
      toStringValue(candidate.brandName),
    model:
      toStringValue(candidate.model) ??
      toStringValue(candidate.model_name) ??
      toStringValue(candidate.modelName),
    distanceMeters:
      toNumberValue(candidate.distanceMeters) ??
      toNumberValue(candidate.distance_meters) ??
      toNumberValue(candidate.distance),
    primary: typeof candidate.primary === "boolean" ? candidate.primary : undefined,
    bikeType,
    ambiguous,
    matchedBikeId:
      toStringValue(candidate.matchedBikeId) ??
      toStringValue(candidate.matched_bike_id) ??
      toStringValue(candidate.existingBikeId) ??
      toStringValue(candidate.bikeId) ??
      toStringValue(candidate.bike_id),
  };
}

function extractRawCandidates(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const key of [
    "bikes",
    "bikeCandidates",
    "gearSummary",
    "gearCandidates",
    "importReview",
    "stravaBikes",
  ]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

export function parseStravaBikeCandidates(
  payload: string | null | undefined
): StravaBikeImportParseResult {
  if (!payload) {
    return { candidates: [], parseError: false };
  }

  try {
    const parsed = JSON.parse(payload) as unknown;
    const candidates = extractRawCandidates(parsed)
      .map((raw, index) => extractCandidate(raw, index))
      .filter((candidate): candidate is StravaBikeImportCandidate => candidate !== null);

    return { candidates, parseError: false };
  } catch {
    return { candidates: [], parseError: true };
  }
}

export function getBikeSignature(input: {
  name?: string | null;
  brand?: string | null;
  model?: string | null;
}): string {
  return [normalizeText(input.name), normalizeText(input.brand), normalizeText(input.model)]
    .filter(Boolean)
    .join("|");
}

export function getAlreadyImportedCandidateIds(
  candidates: StravaBikeImportCandidate[],
  localBikes: Array<{
    _id: string;
    name: string;
    brand?: string | null;
    model?: string | null;
  }>
): Set<string> {
  const localBikeById = new Set(localBikes.map((bike) => bike._id));
  const localSignatures = new Set(
    localBikes.map((bike) =>
      getBikeSignature({
        name: bike.name,
        brand: bike.brand,
        model: bike.model,
      })
    )
  );

  const importedIds = new Set<string>();

  for (const candidate of candidates) {
    if (candidate.matchedBikeId && localBikeById.has(candidate.matchedBikeId)) {
      importedIds.add(candidate.id);
      continue;
    }

    const signature = getBikeSignature({
      name: candidate.name,
      brand: candidate.brand,
      model: candidate.model,
    });

    if (localSignatures.has(signature)) {
      importedIds.add(candidate.id);
    }
  }

  return importedIds;
}

export function formatImportedBikeDistance(distanceMeters?: number): string {
  if (distanceMeters === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat("en-US").format(Math.round(distanceMeters / 1000))} km`;
}

export function formatBikeDistanceKm(
  distanceMeters?: number,
  locale = "en-US"
): string {
  if (distanceMeters === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat(locale).format(Math.round(distanceMeters / 1000))} km`;
}

export function formatBikeSpeedKph(
  speedKph?: number,
  locale = "en-US"
): string {
  if (speedKph === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(speedKph)} kph`;
}

export function formatBikeDate(
  dateMs?: number,
  locale = "en-US"
): string {
  if (dateMs === undefined) {
    return "No recent rides";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(dateMs);
}

export function resolveBikeReadiness(args: {
  imported: boolean;
  needsTypeConfirmation?: boolean;
  currentGeometry?: StravaBikeOverviewLocalBike["currentGeometry"];
  currentSetup?: StravaBikeOverviewLocalBike["currentSetup"];
}): StravaBikeReadiness {
  if (!args.imported) {
    return "available_in_strava";
  }

  if (args.needsTypeConfirmation) {
    return "imported_needs_type_confirmation";
  }

  if (!hasFitGeometry(args) || !hasFitSetup(args)) {
    return "imported_needs_fit_setup";
  }

  return "fit_ready";
}

export function resolveBikeUsageSummary(
  bike: StravaBikeOverviewLocalBike
): StravaBikeUsageSummary {
  const summary = bike.activitySummary ?? null;
  const recentDistanceMeters =
    summary?.recentDistance90dMeters ??
    bike.recentDistance90dMeters ??
    undefined;
  const rideCount =
    summary?.rideCount ??
    bike.rideCount90d ??
    undefined;
  const averageDistanceMeters =
    bike.avgRideDistance90dMeters ??
    (recentDistanceMeters !== undefined && rideCount && rideCount > 0
      ? recentDistanceMeters / rideCount
      : undefined);
  const averageSpeedKph =
    bike.avgSpeed90dKph ??
    (summary?.averageSpeedMps !== undefined
      ? summary.averageSpeedMps * 3.6
      : undefined);
  const lastRideAt = summary?.lastActivityAt ?? bike.lastRideAt ?? undefined;
  const explanationParts = [
    rideCount !== undefined ? `${rideCount} rides` : null,
    averageDistanceMeters !== undefined
      ? `avg ${Math.round(averageDistanceMeters / 1000)} km`
      : null,
    averageSpeedKph !== undefined
      ? `avg ${averageSpeedKph.toFixed(1)} kph`
      : null,
    summary?.dominantSportType ?? bike.dominantSportType ?? null,
  ].filter(Boolean);

  return {
    rideCount,
    recentDistanceMeters,
    avgRideDistanceMeters: averageDistanceMeters,
    avgSpeedKph: averageSpeedKph,
    lastRideAt,
    explanation: explanationParts.length > 0 ? explanationParts.join(" · ") : undefined,
  };
}

export function resolveStravaBikeOverviewCandidate(args: {
  gear: StravaBikeImportCandidate;
  localBike?: StravaBikeOverviewLocalBike | null;
}): StravaBikeOverviewCandidate {
  const imported = Boolean(args.localBike);
  const readiness = resolveBikeReadiness({
    imported,
    needsTypeConfirmation: args.localBike?.needsTypeConfirmation,
    currentGeometry: args.localBike?.currentGeometry,
    currentSetup: args.localBike?.currentSetup,
  });
  const usage = args.localBike ? resolveBikeUsageSummary(args.localBike) : {};

  return {
    ...args.gear,
    imported,
    readiness,
    usage,
  };
}
