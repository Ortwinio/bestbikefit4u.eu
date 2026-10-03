import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalMutation, query, type MutationCtx } from "../_generated/server";
import { requireBikeOwner } from "../lib/authz";

export const DELETE_BATCH_SIZE = 25;

export const preview = query({
  args: { bikeId: v.id("bikes"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const { userId } = await requireBikeOwner(ctx, args.bikeId);
    const result = await ctx.db.query("fitSessions")
      .withIndex("by_user", (range) => range.eq("userId", userId))
      .paginate({ ...args.paginationOpts, numItems: Math.min(args.paginationOpts.numItems, 100), maximumBytesRead: 1_000_000 });
    const matches = await Promise.all(result.page.map(async (session) => {
      if (session.bikeId) return session.bikeId === args.bikeId;
      const profile = session.bikeProfileId ? await ctx.db.get(session.bikeProfileId) : null;
      return profile?.bikeId === args.bikeId;
    }));
    return { ...result, page: result.page.filter((_, index) => matches[index]).map((session) => session._id) };
  },
});

const sessionTables = [
  "questionnaireResponses", "recommendations", "recommendationShadowComparisons",
  "validationCaptures", "rideFeedbackEntries", "emailReports", "fitPassPurchases",
] as const;

const bikeTables = [
  "profileObservations", "pressureCalculations", "pressureProfiles", "gearingSessions", "saddleWidthSessions", "recommendations",
] as const;

const scanTables = [
  "bikeActivities", "bikeImports", "validationCaptures", "rideFeedbackEntries", "feedback_items", "calculatorStates",
] as const;

async function deleteUnusedPhoto(ctx: MutationCtx, storageId: string | undefined) {
  if (!storageId || /^https?:\/\//i.test(storageId)) return;
  const photo = await ctx.db.query("bikePhotos")
    .withIndex("by_storage", (range) => range.eq("storageId", storageId)).first();
  const bike = await ctx.db.query("bikes")
    .withIndex("by_photo_url", (range) => range.eq("photoUrl", storageId)).first();
  const user = await ctx.db.query("users")
    .withIndex("by_profile_image", (range) => range.eq("profile_image_url", storageId)).first();
  if (!photo && !bike && !user) await ctx.storage.delete(storageId as Id<"_storage">);
}

export const cascade = internalMutation({
  args: {
    bikeId: v.id("bikes"),
    userId: v.id("users"),
    photoUrl: v.optional(v.string()),
    stage: v.number(),
    sessionId: v.optional(v.id("fitSessions")),
    sessionStage: v.optional(v.number()),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const schedule = async (next: Partial<typeof args>) => {
      await ctx.scheduler.runAfter(0, internal.bikes.deletion.cascade, { ...args, ...next });
    };
    if (await ctx.db.get(args.bikeId)) throw new Error("Bike must be removed before cleanup");

    if (args.sessionId) {
      const sessionId = args.sessionId;
      const sessionStage = args.sessionStage ?? 0;
      const table = sessionTables[sessionStage];
      if (table) {
        const page = await ctx.db.query(table)
          .withIndex("by_session", (range) => range.eq("sessionId", sessionId))
          .paginate({ cursor: null, numItems: DELETE_BATCH_SIZE, maximumBytesRead: 1_000_000 });
        for (const row of page.page) await ctx.db.delete(row._id);
        await schedule({ sessionStage: sessionStage + (page.isDone ? 1 : 0) });
        return;
      }
      if (sessionStage === sessionTables.length) {
        const rows = await ctx.db.query("reportRateLimits")
          .withIndex("by_identifier", (range) => range.eq("identifier", `report:${sessionId}:${args.userId}`))
          .take(DELETE_BATCH_SIZE);
        for (const row of rows) await ctx.db.delete(row._id);
        await schedule({ sessionStage: sessionStage + (rows.length < DELETE_BATCH_SIZE ? 1 : 0) });
        return;
      }
      const scanTable = (["lifecycleEmailLog", "feedback_items", "bikeProfiles"] as const)[
        sessionStage - sessionTables.length - 1
      ];
      if (scanTable) {
        const page = await ctx.db.query(scanTable).paginate({
          cursor: args.cursor ?? null, numItems: DELETE_BATCH_SIZE, maximumBytesRead: 1_000_000,
        });
        for (const row of page.page) {
          if ("sessionId" in row && row.sessionId === sessionId) await ctx.db.delete(row._id);
          if ("linkedSessionId" in row && row.linkedSessionId === sessionId) {
            await ctx.db.patch(row._id, { linkedSessionId: undefined });
          }
          if ("legacySessionId" in row && row.legacySessionId === sessionId) {
            await ctx.db.patch(row._id, { legacySessionId: undefined });
          }
        }
        await schedule({
          sessionStage: sessionStage + (page.isDone ? 1 : 0), cursor: page.isDone ? null : page.continueCursor,
        });
        return;
      }
      await schedule({ sessionId: undefined, sessionStage: undefined, cursor: null });
      return;
    }

    if (args.stage === 0) {
      const session = await ctx.db.query("fitSessions")
        .withIndex("by_user_bike", (range) => range.eq("userId", args.userId).eq("bikeId", args.bikeId)).first();
      if (session) {
        await ctx.db.delete(session._id);
        await schedule({ sessionId: session._id, sessionStage: 0 });
        return;
      }
      const profile = await ctx.db.query("bikeProfiles")
        .withIndex("by_bike", (range) => range.eq("bikeId", args.bikeId)).first();
      if (profile) {
        const profileSession = await ctx.db.query("fitSessions")
          .withIndex("by_bike_profile", (range) => range.eq("bikeProfileId", profile._id)).first();
        if (profileSession) {
          await ctx.db.delete(profileSession._id);
          await schedule({ sessionId: profileSession._id, sessionStage: 0 });
          return;
        }
        await ctx.db.delete(profile._id);
        await schedule({});
        return;
      }
      await schedule({ stage: 1 });
      return;
    }

    const bikeTable = bikeTables[args.stage - 1];
    if (bikeTable) {
      const page = await ctx.db.query(bikeTable)
        .withIndex("by_bike", (range) => range.eq("bikeId", args.bikeId))
        .paginate({ cursor: null, numItems: DELETE_BATCH_SIZE, maximumBytesRead: 1_000_000 });
      for (const row of page.page) await ctx.db.delete(row._id);
      await schedule({ stage: args.stage + (page.isDone ? 1 : 0) });
      return;
    }
    const scanTable = scanTables[args.stage - bikeTables.length - 1];
    if (scanTable) {
      const page = await ctx.db.query(scanTable).paginate({
        cursor: args.cursor ?? null, numItems: DELETE_BATCH_SIZE, maximumBytesRead: 1_000_000,
      });
      for (const row of page.page) {
        if ("bikeId" in row && row.bikeId === args.bikeId) await ctx.db.delete(row._id);
        if ("createdBikeId" in row && row.createdBikeId === args.bikeId) {
          await ctx.db.delete(row._id);
        } else if ("duplicateBikeId" in row && row.duplicateBikeId === args.bikeId) {
          if (row.createdBikeId) await ctx.db.patch(row._id, { duplicateBikeId: undefined });
          else await ctx.db.delete(row._id);
        }
        if ("linkedBikeId" in row && row.linkedBikeId === args.bikeId) {
          await ctx.db.patch(row._id, { linkedBikeId: undefined });
        }
      }
      await schedule({ stage: args.stage + (page.isDone ? 1 : 0), cursor: page.isDone ? null : page.continueCursor });
      return;
    }

    const wheelset = await ctx.db.query("wheelsets")
      .withIndex("by_bike", (range) => range.eq("bikeId", args.bikeId)).first();
    if (wheelset) {
      const tires = await ctx.db.query("tireSetups")
        .withIndex("by_wheelset", (range) => range.eq("wheelsetId", wheelset._id)).take(DELETE_BATCH_SIZE);
      for (const tire of tires) await ctx.db.delete(tire._id);
      if (tires.length < DELETE_BATCH_SIZE) await ctx.db.delete(wheelset._id);
      await schedule({});
      return;
    }
    const photos = await ctx.db.query("bikePhotos")
      .withIndex("by_bike", (range) => range.eq("bikeId", args.bikeId)).take(1);
    for (const photo of photos) {
      await ctx.db.delete(photo._id);
      await deleteUnusedPhoto(ctx, photo.storageId);
    }
    if (photos.length) {
      await schedule({ photoUrl: photos[0].storageId === args.photoUrl ? undefined : args.photoUrl });
    } else {
      await deleteUnusedPhoto(ctx, args.photoUrl);
    }
  },
});
