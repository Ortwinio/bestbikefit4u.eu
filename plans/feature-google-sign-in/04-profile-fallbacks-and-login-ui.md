# Step 04: Profile Fallback Logic and Login UI

## Objective

Expose Google sign-in in the UI and render profile identity using a clear fallback chain that respects manual overrides.

## Files In Scope

- [`src/app/(auth)/login/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/login/page.tsx)
- [`src/components/profile/ProfilePhotoUpload.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/profile/ProfilePhotoUpload.tsx)
- dashboard/profile/settings/sidebar components that render user identity
- any shared selector/helper added under `src/lib/`

## Login UI Plan

1. Add a secondary auth action above or below the email form:
   - button label: `Continue with Google`
2. Keep visual hierarchy clean:
   - Google button first or clearly grouped
   - email magic-code form remains available below
3. Use the same locale-aware page shell and analytics conventions already present on the login page.
4. Handle OAuth redirect initiation through `signIn("google", { redirectTo })`.

## Profile Fallback Plan

Create typed selectors/helpers such as:

- `getEffectiveDisplayName(user)`
- `getEffectiveProfileImage(user)`

Fallback order:

### Display name

1. `user.displayName` when present
2. `user.googleName`
3. existing auth/user `name`
4. email local-part
5. current generic fallback text

### Profile image

1. resolved custom upload from `user.profile_image_url`
2. `user.googleProfileImageUrl`
3. existing auth/user `image`
4. `/default-profile.svg`

## Ownership Integration

- `ProfilePhotoUpload` must continue to write custom uploads to `profile_image_url` and mark manual ownership.
- If the profile page later exposes editable display name, that mutation must also mark manual ownership.
- All major user-identity surfaces should use the same helper, not reimplement the fallback chain independently.

## Acceptance Check

- Login page shows a clean Google button plus the existing email login
- Profile page, sidebar, dashboard, and settings agree on the same effective name/image
- Manual custom image always wins over Google image
