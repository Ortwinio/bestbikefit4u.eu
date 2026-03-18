# 01 — Schema Updates and File Storage

## Goal

Add the missing fields to the Convex schema and set up Convex file storage for profile and bike images. After this step the data layer supports everything the UI needs, but no UI changes are made yet.

## Background

The current schema is missing:
- `users.profile_image_url` (string) — URL of stored profile photo
- `users.theme_preference` ("light" | "dark" | "system") — persisted theme choice

Everything else needed already exists or should be verified before changing:
- `users.tier` — "free" | "pro" (account type)
- `profiles.weightKg` — optional, already in schema
- `bikes.photoUrl` — optional string, already in schema

Convex file storage (`ctx.storage`) is the right choice for image uploads. It avoids adding an external storage dependency and keeps authorization within the Convex security model.

## Steps

### 1. Update `convex/schema.ts`

In the `users` table definition, add:
```ts
profile_image_url: v.optional(v.string()),
theme_preference: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
```

Do not add anything else — all other needed fields are present.

### 2. Add Convex file storage HTTP action for image uploads

Create `convex/files/actions.ts` with:
- A `generateUploadUrl` action (no auth needed at mutation level — auth check must happen in the calling mutation):
  ```ts
  export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
      await requireUserId(ctx); // Must be authenticated
      return await ctx.storage.generateUploadUrl();
    },
  });
  ```
- A `getUrl` query:
  ```ts
  export const getUrl = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
      return await ctx.storage.getUrl(args.storageId);
    },
  });
  ```
- A `deleteFile` mutation:
  ```ts
  export const deleteFile = mutation({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
      await requireUserId(ctx);
      await ctx.storage.delete(args.storageId);
    },
  });
  ```

### 3. Add or extend a user-preferences mutation in `convex/users/mutations.ts`

There is no `updateProfile` mutation in the current repo. Add one, or another clearly named user-preferences mutation, that can set `profile_image_url` and `theme_preference`:
```ts
export const updateProfile = mutation({
  args: {
    profile_image_url: v.optional(v.string()),
    theme_preference: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await ctx.db.patch(userId, args);
  },
});
```

Check if a similar mutation already exists and extend it rather than creating a duplicate.

### 4. Confirm `convex/bikes/mutations.ts` uses the existing field naming

The `bikes` table already has a `photoUrl` field. Confirm the `create` and `update` mutations both accept `photoUrl: v.optional(v.string())`. They already do in the current repo, so do not rename them.

### 5. Verify

Run `npx convex dev` or the dev server and confirm:
- No schema validation errors
- TypeScript codegen regenerates without errors (`npm run typecheck`)

## Acceptance Criteria

- [ ] `users` table schema includes `profile_image_url` and `theme_preference`
- [ ] `convex/files/actions.ts` (or equivalent) has `generateUploadUrl`, `getUrl`, `deleteFile`
- [ ] user preferences mutation handles both new fields
- [ ] `bikes` create/update accept `photoUrl` field
- [ ] `npm run typecheck` passes
