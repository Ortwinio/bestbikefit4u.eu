import { paginationOptsValidator, type PaginationOptions } from "convex/server";
import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { planLegacyObservations } from "../../shared/profileObservationMigration";

const MAX_PAGE_SIZE = 10;
const args = { paginationOpts: paginationOptsValidator, dryRun: v.optional(v.boolean()) };

async function migratePage(ctx: MutationCtx, table: "profiles" | "bikes", paginationOpts: PaginationOptions, dryRun = true) {
  if (!Number.isInteger(paginationOpts.numItems) || paginationOpts.numItems < 1) {
    throw new Error("Migration page size must be a positive integer");
  }
  const page = await ctx.db.query(table).paginate({ ...paginationOpts,
    numItems: Math.min(paginationOpts.numItems, MAX_PAGE_SIZE), maximumRowsRead: MAX_PAGE_SIZE,
    maximumBytesRead: 1_000_000 });
  const counts = { documents: page.page.length, candidates: 0, planned: 0, preservedCurrent: 0, invalidValues: 0 };
  const plannedScopes = new Set<string>();
  const inserts: Array<Omit<Doc<"profileObservations">, "_id" | "_creationTime">> = [];
  for (const document of page.page) {
    const bike = "bikeType" in document ? document : undefined;
    const geometry = bike?.geometryRecordId ? await ctx.db.get(bike.geometryRecordId) : undefined;
    const plan = planLegacyObservations(table, document, geometry);
    counts.invalidValues += plan.invalidValues;
    for (const candidate of plan.observations) {
      counts.candidates++;
      const scope = JSON.stringify([document.userId, candidate.field, bike?._id ?? null]);
      if (plannedScopes.has(scope)) { counts.preservedCurrent++; continue; }
      const current = await ctx.db.query("profileObservations")
        .withIndex("by_user_field_bike_status", range => range.eq("userId", document.userId)
          .eq("field", candidate.field).eq("bikeId", bike?._id).eq("status", "current"))
        .take(1);
      if (current.length) {
        counts.preservedCurrent++;
        continue;
      }
      counts.planned++;
      plannedScopes.add(scope);
      inserts.push({ ...candidate, userId: document.userId,
        ...(bike ? { bikeId: bike._id } : {}), source: "legacy_migration", status: "current" });
    }
  }
  if (!dryRun) for (const observation of inserts) await ctx.db.insert("profileObservations", observation);
  return { counts, continueCursor: page.continueCursor, isDone: page.isDone };
}

export const migrateProfiles = internalMutation({ args,
  handler: (ctx, options) => migratePage(ctx, "profiles", options.paginationOpts, options.dryRun),
});

export const migrateBikes = internalMutation({ args,
  handler: (ctx, options) => migratePage(ctx, "bikes", options.paginationOpts, options.dryRun),
});
