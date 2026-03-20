# Plan: Google Sign-In for BestBikeFit4U

## Goal

Add production-safe Google OAuth sign-in to the existing Next.js + Convex Auth stack, while preserving the current email magic-code login and respecting user-owned profile edits.

## Background

The current app already uses `@convex-dev/auth` with a Resend email provider configured in [`convex/auth.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/auth.ts). The schema already extends the Convex auth `users` table and stores `name`, `email`, `image`, and the app-specific `profile_image_url` in [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts). The login UI in [`src/app/(auth)/login/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/login/page.tsx) is currently email-code only. Profile photo uploads are handled by [`src/components/profile/ProfilePhotoUpload.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/profile/ProfilePhotoUpload.tsx), which writes a custom image ID into `users.profile_image_url`.

The extension point for safe Google data sync is Convex Auth’s `callbacks.createOrUpdateUser`, which can decide how OAuth profile data is written during account creation and subsequent sign-ins.

## Scope

- Add Google OAuth provider configuration to Convex Auth
- Preserve the current email magic-code login path
- Sync Google `name`, `email`, and profile image into the app-owned `users` record
- Introduce explicit ownership/source rules so manual edits always win over Google
- Add profile-page fallback logic for display name and profile image
- Add a "Continue with Google" button on the login page
- Add migration and rollout notes for production

## Out of Scope

- Removing or redesigning the existing email sign-in flow
- Full account-linking UX beyond automatic safe linking rules
- Billing/provider management UI
- Retroactive backfill of arbitrary historic profile data outside authenticated re-login

## Key Design Decisions

- Use Convex Auth OAuth support directly rather than introducing a parallel NextAuth/Auth.js app router setup.
- Keep Google-derived data separate from user-managed profile data where ownership matters.
- Track whether profile image and display name are still Google-managed or have become user-managed.
- Never overwrite a user-uploaded `profile_image_url`.
- Never overwrite a manually edited display name once the user has taken ownership.
- Prefer explicit source fields over heuristic comparisons. Production behavior needs to be deterministic.

## Proposed Data Model Direction

Current `users` fields are insufficient to distinguish Google-owned defaults from user-owned overrides. Add a small ownership model on `users`:

- `googleEmail: string | undefined`
- `googleName: string | undefined`
- `googleProfileImageUrl: string | undefined`
- `displayName: string | undefined`
- `displayNameSource: "google" | "manual" | "email" | undefined`
- `profileImageSource: "google" | "manual" | undefined`
- `lastGoogleSyncAt: number | undefined`

Notes:
- `displayName` becomes the app-owned name used by UI.
- Existing auth-managed `name` and `image` should still be treated as provider/raw auth data, not the final UI contract.
- `profile_image_url` remains the custom uploaded image storage ID or direct app-owned image value.
- The effective profile image becomes:
  1. custom uploaded image from `profile_image_url`
  2. Google image from `googleProfileImageUrl`
  3. static placeholder

## Linking Rules

- Existing email magic-code login remains active.
- If a Google sign-in returns an email that already maps to an existing user, link to that user instead of creating a duplicate account, subject to Convex Auth’s safe linking behavior.
- If a Google sign-in creates a new user, seed app-owned defaults from Google immediately.
- If the user later edits `displayName`, switch `displayNameSource` to `"manual"`.
- If the user later uploads a custom profile image, switch `profileImageSource` to `"manual"`.
- Future Google logins may refresh `googleName` / `googleProfileImageUrl` for reference, but must not replace effective UI fields once the source is manual.

## Acceptance Criteria

- [ ] User can sign in with Google from the existing login page
- [ ] Existing email magic-code login still works
- [ ] First successful Google login stores Google email, name, and image on the user record
- [ ] Profile page defaults to Google name if the user has not manually set a display name
- [ ] Profile page defaults to Google image if the user has not uploaded a custom image
- [ ] Uploading a custom profile image prevents future Google overwrites
- [ ] Manually editing display name prevents future Google overwrites
- [ ] Account linking avoids duplicate users for the same email where safe
- [ ] Google client ID/secret and redirect flow are documented for production
- [ ] Implementation includes typed user/profile helpers and targeted tests

## Rollout Steps

| Step | File | Status | Focus |
|------|------|--------|-------|
| 01 | `01-auth-configuration.md` | Todo | Google OAuth provider wiring in Convex Auth |
| 02 | `02-database-schema.md` | Todo | User schema and ownership/source fields |
| 03 | `03-google-sync-logic.md` | Todo | `createOrUpdateUser` sync rules and linking behavior |
| 04 | `04-profile-fallbacks-and-login-ui.md` | Todo | Login button, profile fallback logic, manual override handling |
| 05 | `05-migration-and-rollout.md` | Todo | Env vars, rollout order, migration notes, validation |

## Implementation Notes

- `convex/auth.ts` is the authoritative auth entrypoint. Extend it there.
- `convex/auth.config.ts` currently sets the Convex application metadata only; keep it aligned if OAuth redirect assumptions change.
- `src/app/(auth)/login/page.tsx` should add Google as a parallel sign-in option, not a replacement.
- `convex/users/mutations.ts` needs explicit mutations for manual display-name ownership if the UI does not already expose one.
- `src/components/profile/ProfilePhotoUpload.tsx` already defines the custom-image handoff point; this is where `profileImageSource` should flip to `"manual"`.
- Keep fallback resolution centralized in a typed selector/helper so dashboard, settings, profile, and sidebar all render the same effective values.

## Migration Notes Preview

- Existing users should default to manual ownership for any already-set custom `profile_image_url`.
- Existing `users.name` values need a one-time mapping decision:
  - if there is no evidence of Google ownership, treat them as current effective display names and set `displayNameSource` conservatively
  - avoid destructive backfill that could erase current names
- Production needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and verified redirect URIs before rollout
- Deploy order should be:
  1. schema + backend sync logic
  2. production env vars
  3. frontend login button + fallback UI
  4. smoke tests for both email and Google sign-in
