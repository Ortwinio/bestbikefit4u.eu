import type { Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateShortString } from "../lib/validation";

async function listBikePhotos(ctx: MutationCtx, bikeId: Id<"bikes">) {
  return await ctx.db
    .query("bikePhotos")
    .withIndex("by_bike", (q) => q.eq("bikeId", bikeId))
    .collect();
}

async function syncPrimaryPhoto(
  ctx: MutationCtx,
  bikeId: Id<"bikes">,
  storageId: string | undefined
) {
  await ctx.db.patch(bikeId, {
    photoUrl: storageId,
    updatedAt: Date.now(),
  });
}

async function markPrimaryPhoto(
  ctx: MutationCtx,
  bikeId: Id<"bikes">,
  photoId: Id<"bikePhotos">
) {
  const now = Date.now();
  const photos = await listBikePhotos(ctx, bikeId);
  let primaryStorageId: string | undefined;

  await Promise.all(
    photos.map(async (photo) => {
      const isPrimary = photo._id === photoId;
      if (isPrimary) {
        primaryStorageId = photo.storageId;
      }
      await ctx.db.patch(photo._id, {
        isPrimary,
        updatedAt: now,
      });
    })
  );

  await syncPrimaryPhoto(ctx, bikeId, primaryStorageId);
}

export const create = mutation({
  args: {
    bikeId: v.id("bikes"),
    storageId: v.string(),
    caption: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.caption !== undefined) validateShortString(args.caption, "caption");
    const { userId, bike } = await requireBikeOwner(ctx, args.bikeId);
    const now = Date.now();
    const existingPhotos = await listBikePhotos(ctx, bike._id);
    let photoCount = existingPhotos.length;

    if (
      photoCount === 0 &&
      typeof bike.photoUrl === "string" &&
      bike.photoUrl.length > 0 &&
      bike.photoUrl !== args.storageId
    ) {
      await ctx.db.insert("bikePhotos", {
        userId,
        bikeId: bike._id,
        storageId: bike.photoUrl,
        isPrimary: args.isPrimary !== true,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      });
      photoCount += 1;
    }

    const shouldBePrimary = args.isPrimary === true || photoCount === 0;

    if (shouldBePrimary) {
      await Promise.all(
        existingPhotos.map((photo) =>
          ctx.db.patch(photo._id, { isPrimary: false, updatedAt: now })
        )
      );
    }

    const photoId = await ctx.db.insert("bikePhotos", {
      userId,
      bikeId: bike._id,
      storageId: args.storageId,
      caption: args.caption,
      isPrimary: shouldBePrimary,
      sortOrder: photoCount,
      createdAt: now,
      updatedAt: now,
    });

    if (shouldBePrimary) {
      await syncPrimaryPhoto(ctx, bike._id, args.storageId);
    }

    return photoId;
  },
});

export const update = mutation({
  args: {
    photoId: v.id("bikePhotos"),
    caption: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.caption !== undefined) validateShortString(args.caption, "caption");
    const userId = await requireUserId(ctx);
    const photo = await ctx.db.get(args.photoId);
    if (!photo || photo.userId !== userId) {
      throw new Error("Bike photo not found");
    }

    if (args.isPrimary === true) {
      await markPrimaryPhoto(ctx, photo.bikeId, photo._id);
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    if (args.caption !== undefined) {
      updates.caption = args.caption;
    }
    if (args.isPrimary === true) {
      updates.isPrimary = args.isPrimary;
    }

    await ctx.db.patch(args.photoId, updates);
  },
});

export const remove = mutation({
  args: { photoId: v.id("bikePhotos") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const photo = await ctx.db.get(args.photoId);
    if (!photo || photo.userId !== userId) {
      throw new Error("Bike photo not found");
    }

    const siblings = (await listBikePhotos(ctx, photo.bikeId)).filter(
      (row) => row._id !== photo._id
    );
    await ctx.storage.delete(photo.storageId as Id<"_storage">);
    await ctx.db.delete(photo._id);

    if (photo.isPrimary) {
      const nextPrimary = [...siblings].sort((a, b) => a.createdAt - b.createdAt)[0];
      if (nextPrimary) {
        await markPrimaryPhoto(ctx, photo.bikeId, nextPrimary._id);
      } else {
        await syncPrimaryPhoto(ctx, photo.bikeId, undefined);
      }
      return;
    }

    await syncPrimaryPhoto(
      ctx,
      photo.bikeId,
      siblings.find((row) => row.isPrimary)?.storageId
    );
  },
});
