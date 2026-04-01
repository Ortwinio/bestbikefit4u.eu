"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import type { ActionCtx } from "../_generated/server";
import { generateBikeDescription } from "./description";

export const generateDescription = action({
  args: {
    bikeId: v.id("bikes"),
    locale: v.union(v.literal("en"), v.literal("nl")),
  },
  handler: async (ctx, args) => {
    const detail = await ctx.runQuery(api.bikes.queries.getDetail, {
      bikeId: args.bikeId,
    });

    const result = await generateBikeDescription({
      locale: args.locale,
      name: detail.bike.name,
      bikeType: detail.bike.bikeType,
      brand: detail.bike.brand,
      model: detail.bike.model,
      ridingStyle: detail.bike.ridingStyle,
      primaryGoal: detail.bike.primaryGoal,
      notes: detail.bike.notes,
      activitySummary: detail.bike.activitySummary
        ? {
            inferredBikeRole: detail.bike.activitySummary.inferredBikeRole,
            inferredRidingStyle: detail.bike.activitySummary.inferredRidingStyle,
            totalDistanceKm: detail.bike.activitySummary.totalDistanceKm,
            commuteRatio: detail.bike.activitySummary.commuteRatio,
            trainerRatio: detail.bike.activitySummary.trainerRatio,
          }
        : null,
    });

    await ctx.runMutation(api.bikes.mutations.update, {
      bikeId: args.bikeId,
      description: result.description,
      descriptionSource: result.source,
    });

    return result;
  },
});

async function previewImportByPassportIdHandler(
  ctx: ActionCtx,
  args: { bikePassportId: string }
): Promise<unknown> {
  const previewPromise: Promise<unknown> = ctx.runQuery(api.bikes.queries.lookupByPassportId, {
    bikePassportId: args.bikePassportId,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("passport_preview_timeout")), 3500);
  });

  try {
    return await Promise.race([previewPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === "passport_preview_timeout") {
      throw new Error("backend_unavailable");
    }
    throw error;
  }
}

export const previewImportByPassportId = action({
  args: {
    bikePassportId: v.string(),
  },
  handler: previewImportByPassportIdHandler,
});
