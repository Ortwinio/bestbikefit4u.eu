type StravaGearSummaryEntry = {
  id: string;
  name: string;
};

type LocalBikeRecord = {
  _id: string;
  name: string;
  stravaGearId?: string | null;
};

type AutoImportPlanInput = {
  userId?: string | null;
  accessStatus?: string | null;
  gearSummary?: StravaGearSummaryEntry[] | null;
  localBikes?: LocalBikeRecord[] | null;
};

const AUTO_IMPORT_SESSION_KEY_PREFIX = "bbf4u:strava:auto-import";

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getStravaAutoImportSessionKey(userId: string): string {
  return `${AUTO_IMPORT_SESSION_KEY_PREFIX}:${userId}`;
}

export function getStravaAutoImportLoginSessionKey(
  userId: string,
  lastLoginAt: number
): string {
  return `${AUTO_IMPORT_SESSION_KEY_PREFIX}:${userId}:${lastLoginAt}`;
}

export function getMissingStravaGearIds(
  gearSummary: StravaGearSummaryEntry[],
  localBikes: LocalBikeRecord[]
): string[] {
  const importedGearIds = new Set(
    localBikes.flatMap((bike) => (bike.stravaGearId ? [bike.stravaGearId] : []))
  );
  const importedNames = new Set(localBikes.map((bike) => normalizeName(bike.name)));

  return gearSummary
    .filter(
      (gear) =>
        !importedGearIds.has(gear.id) && !importedNames.has(normalizeName(gear.name))
    )
    .map((gear) => gear.id);
}

export function getStravaAutoImportPlan({
  userId,
  accessStatus,
  gearSummary,
  localBikes,
}: AutoImportPlanInput): {
  sessionKey: string;
  missingGearIds: string[];
} | null {
  if (!userId || accessStatus !== "active" || !gearSummary || !localBikes) {
    return null;
  }

  return {
    sessionKey: getStravaAutoImportSessionKey(userId),
    missingGearIds: getMissingStravaGearIds(gearSummary, localBikes),
  };
}
