# Step 05: Migration Notes and Rollout

## Objective

Roll out Google sign-in without breaking existing users, existing email login, or user-owned profile data.

## Migration Notes

### Existing Users

- Existing users already in the `users` table must remain valid with all new fields optional.
- If a user already has `profile_image_url`, treat that as manual ownership from day one.
- Existing `users.name` should not be blindly replaced. During rollout:
  - if `displayName` is absent, seed it conservatively from current user-visible data
  - avoid backfill logic that rewrites names en masse without ownership metadata

### First-Time Google Users

- New users created through Google should start with:
  - `displayName` seeded from Google
  - `displayNameSource = "google"`
  - `googleEmail`, `googleName`, `googleProfileImageUrl` set
  - `profileImageSource = "google"` if no custom image exists

### Existing Email Users Who Later Add Google

- Safe linking by verified email is required to prevent duplicate accounts.
- After linking, Google data becomes a fallback/default source only.
- Existing manual profile photo or edited display name must remain unchanged.

## Production Configuration

Add and validate:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SITE_URL`
- any authorized redirect URI configured in Google Cloud Console for Convex Auth

## Validation Matrix

1. Existing email-only user can still request and verify a code.
2. New user can sign in with Google and lands on dashboard.
3. First Google login seeds default display name and image.
4. User uploads custom image, signs out, signs back in with Google, custom image remains.
5. User edits display name, signs out, signs back in with Google, edited name remains.
6. Existing email user signs in with Google using same email, account links instead of duplicating.
7. TypeScript, Convex codegen, and auth redirect flow all pass.

## Release Order

1. Ship schema and backend callback logic first.
2. Set production Google env vars and redirect URIs.
3. Deploy frontend Google button and fallback selectors.
4. Smoke test both sign-in methods in production.
5. Monitor for duplicate-user creation and profile overwrite regressions.

## Recommended Tests

- Unit tests for fallback selectors
- Contract tests for `createOrUpdateUser` ownership rules
- Integration tests for:
  - first Google login
  - linked existing user login
  - manual name/image preservation

## Acceptance Check

- Migration is additive and reversible at the config level
- Existing users are not locked out
- Production rollout order is explicit
