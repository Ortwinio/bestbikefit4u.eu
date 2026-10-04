import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

const TARGET_ORIGIN = "https://bikefitboost.com";
const LEGACY_ORIGINS = new Set(["https://bestbikefit4u.eu", "https://www.bestbikefit4u.eu"]);

/** Change only the authority; preserve the path, query and fragment exactly. */
export function migratedGuideImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || /[\s\\\u0000-\u001f\u007f]/u.test(value)) return null;
  const authority = /^https:\/\/[^/?#]+/u.exec(value)?.[0];
  if (!authority || !LEGACY_ORIGINS.has(authority)) return null;
  try {
    const parsed = new URL(value);
    if (!LEGACY_ORIGINS.has(parsed.origin) || parsed.username || parsed.password) return null;
    return TARGET_ORIGIN + value.slice(authority.length);
  } catch {
    return null;
  }
}

function isSnapshot(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

export const rewriteGuideImageUrls = internalMutation({
  args: {
    table: v.union(v.literal("guidePages"), v.literal("guideRevisions")),
    cursor: v.union(v.string(), v.null()),
    numItems: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, { table, cursor, numItems = 25, dryRun = true }) => {
    if (!Number.isInteger(numItems) || numItems < 1 || numItems > 100) {
      throw new Error("Migration page size must be an integer from 1 to 100");
    }
    const page = await ctx.db.query(table).paginate({
      cursor, numItems, maximumRowsRead: 100, maximumBytesRead: 1_000_000,
    });
    const counts = { scanned: page.page.length, eligible: 0, updated: 0, skipped: 0, invalidSnapshots: 0 };
    for (const document of page.page) {
      if ("snapshot" in document) {
        if (!isSnapshot(document.snapshot)) {
          counts.invalidSnapshots++;
          counts.skipped++;
          continue;
        }
        const url = migratedGuideImageUrl(document.snapshot.ogImageUrl);
        if (url === null) { counts.skipped++; continue; }
        counts.eligible++;
        if (!dryRun) {
          await ctx.db.patch(document._id, { snapshot: { ...document.snapshot, ogImageUrl: url } });
          counts.updated++;
        }
      } else {
        const url = migratedGuideImageUrl(document.ogImageUrl);
        if (url === null) { counts.skipped++; continue; }
        counts.eligible++;
        if (!dryRun) {
          await ctx.db.patch(document._id, { ogImageUrl: url });
          counts.updated++;
        }
      }
    }
    return { table, dryRun, counts, continueCursor: page.continueCursor, isDone: page.isDone };
  },
});
