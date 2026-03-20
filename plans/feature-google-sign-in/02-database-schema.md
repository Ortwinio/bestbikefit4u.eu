# Step 02: Database Schema Changes

## Objective

Extend the `users` table so the app can distinguish provider-synced defaults from user-owned profile data.

## Files In Scope

- [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- generated bindings after schema changes

## Plan

Add explicit fields to `users` for Google sync state and UI ownership:

- `googleEmail: v.optional(v.string())`
- `googleName: v.optional(v.string())`
- `googleProfileImageUrl: v.optional(v.string())`
- `displayName: v.optional(v.string())`
- `displayNameSource: v.optional(v.union(v.literal("google"), v.literal("manual"), v.literal("email")))`
- `profileImageSource: v.optional(v.union(v.literal("google"), v.literal("manual")))`
- `lastGoogleSyncAt: v.optional(v.number())`

Keep existing fields:

- `email`
- `name`
- `image`
- `profile_image_url`

## Why This Split

- `name` and `image` are provider/auth-adjacent fields and should not be the only source of truth for user-facing profile rendering.
- `displayName` expresses the app’s effective display name.
- `googleName` and `googleProfileImageUrl` preserve provider data for fallback and auditability.
- Source fields make the "never overwrite manual edits" rule explicit and testable.

## Compatibility Rules

- Existing `profile_image_url` stays authoritative for custom uploads.
- Existing users without Google data continue to work with placeholder image/name fallbacks.
- Schema additions must be optional to avoid breaking existing rows during rollout.

## Acceptance Check

- The schema can represent all three states:
  - no Google data
  - Google-managed defaults
  - user-managed overrides
- No existing user document becomes invalid.
