import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type FieldChange = {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
};

const SYSTEM_FIELD_NAMES = new Set([
  "_creationTime",
  "_id",
  "updatedAt",
  "updatedBy",
  "version",
  "lastUpdatedAt",
  "publishedAt",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pushFieldChanges(
  changes: FieldChange[],
  field: string,
  oldValue: unknown,
  newValue: unknown
) {
  if (oldValue === undefined && newValue === undefined) {
    return;
  }

  if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
    return;
  }

  if (isPlainObject(oldValue) && isPlainObject(newValue)) {
    const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    for (const key of keys) {
      pushFieldChanges(
        changes,
        field ? `${field}.${key}` : key,
        oldValue[key],
        newValue[key]
      );
    }
    return;
  }

  changes.push({ field, oldValue, newValue });
}

export function buildGuideFieldChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): FieldChange[] {
  const keys = new Set(Object.keys(after));
  const changes: FieldChange[] = [];

  for (const key of keys) {
    if (SYSTEM_FIELD_NAMES.has(key)) {
      continue;
    }
    pushFieldChanges(changes, key, before[key], after[key]);
  }

  return changes;
}

export async function writeGuideAuditLog(
  ctx: MutationCtx,
  {
    guideId,
    action,
    resourceType,
    resourceId,
    userId,
    fieldChanges = [],
    metadata,
  }: {
    guideId?: Id<"guidePages">;
    action: string;
    resourceType: "guide" | "redirect";
    resourceId: string;
    userId: Id<"users">;
    fieldChanges?: FieldChange[];
    metadata?: Record<string, unknown>;
  }
) {
  const user = await ctx.db.get(userId);
  const userEmail =
    user?.email?.trim().toLowerCase() ??
    user?.googleEmail?.trim().toLowerCase() ??
    undefined;

  if (!userEmail) {
    throw new Error("Guide audit log requires a user email");
  }

  await ctx.db.insert("guideAuditLog", {
    guideId,
    action,
    resourceType,
    resourceId,
    fieldChanges,
    userId,
    userEmail,
    timestamp: Date.now(),
    metadata,
  });
}

export type GuideAuditLogRow = Doc<"guideAuditLog">;
