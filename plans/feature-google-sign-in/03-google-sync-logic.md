# Step 03: Sync Logic After Login

## Objective

Implement safe Google-to-user sync during authentication using Convex Auth’s lifecycle callbacks, without requiring a separate client-side "complete profile" mutation after sign-in.

## Files In Scope

- [`convex/auth.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/auth.ts)
- [`convex/users/mutations.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/users/mutations.ts)
- typed user helpers under `convex/lib/` or `src/lib/` if needed

## Primary Hook

Use Convex Auth `callbacks.createOrUpdateUser`.

Reason:
- It runs inside the sign-in lifecycle.
- It receives the provider type, raw profile, and any existing linked user.
- It can safely decide whether to create, patch, or reuse a user document.

## Sync Rules

For `type === "oauth"` and provider `google`:

1. Resolve the effective target user.
   - If `existingUserId` is present, patch that user.
   - If no existing user is linked but a same-email user can be safely linked, reuse that user per Convex Auth linking policy.
   - Otherwise create a new user.

2. Always persist provider reference data when available:
   - `googleEmail`
   - `googleName`
   - `googleProfileImageUrl`
   - `lastGoogleSyncAt`

3. Seed defaults only when the user has not taken manual ownership:
   - If `displayNameSource` is not `"manual"` and `displayName` is empty, set from Google name and mark `"google"`.
   - If `profileImageSource` is not `"manual"` and `profile_image_url` is empty, do not write the Google URL into `profile_image_url`; instead keep `googleProfileImageUrl` and mark `"google"`.

4. Preserve manual ownership:
   - Never overwrite `displayName` when `displayNameSource === "manual"`.
   - Never overwrite custom profile image when `profileImageSource === "manual"` or `profile_image_url` is set by upload flow.

5. Preserve core auth hygiene:
   - refresh `lastLoginAt`
   - keep `email` aligned with verified provider email where appropriate

## Manual Ownership Transitions

- When the user edits their display name via app UI, patch:
  - `displayName`
  - `displayNameSource = "manual"`
- When the user uploads a profile image, patch:
  - `profile_image_url`
  - `profileImageSource = "manual"`

## Acceptance Check

- First Google login seeds defaults
- Later Google logins refresh provider data but do not clobber manual values
- Sync logic is server-owned and does not depend on fragile client timing
