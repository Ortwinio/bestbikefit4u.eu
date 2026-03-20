# Step 02 — Profile Photo Import (Phase 1 MVP)

## Goal

Import the Strava athlete profile photo and offer it as the user's BestBikeFit4U profile image.

## Logic

### At connect time (callback handler)

After storing the integration record in Step 01:

```ts
const hasExistingPhoto = !!existingUser.profile_image_url;

if (!hasExistingPhoto && integration.athleteAvatarUrl) {
  // Automatically use Strava photo — no prompt needed
  await ctx.db.patch(userId, {
    profile_image_url: integration.athleteAvatarUrl,
    profileImageSource: "strava",
  });
  // Redirect to /settings?strava=connected&photo=imported
} else if (hasExistingPhoto && integration.athleteAvatarUrl) {
  // User has existing photo — they will be prompted in settings
  // Redirect to /settings?strava=connected&photo=available
}
```

### Settings page — photo import prompt

When `?photo=available` is present in the URL on return from Strava:

Show a one-time toast or inline notice in the settings Strava section:
```
Your Strava profile photo is available.
[Preview and import]  [Keep current photo]
```

"Preview and import" opens a modal:
```
┌─────────────────────────────────────────────┐
│ Import Strava profile photo?                │
│                                             │
│  [Strava photo preview, ~80x80px]           │
│                                             │
│  This will replace your current profile     │
│  photo. You can change it again at any      │
│  time in Settings.                          │
│                                             │
│  [Cancel]          [Use this photo]         │
└─────────────────────────────────────────────┘
```

On confirm: call a new mutation `importStravaPhoto` that patches `users.profile_image_url` and `profileImageSource`.

### Settings page — "Import from Strava" affordance (ongoing)

When Strava is connected and `integration.athleteAvatarUrl` is present, show in the settings Connected Apps section:

```
Profile photo: [current source label]  [Import from Strava]
```

The "Import from Strava" button is always available (not just at connect time), in case the user wants to switch to their Strava photo later.

### Strava weight prompt

If `integration.athleteStravaWeight` is set and differs from `profiles.weightKg` by ≥ 1 kg:

Show a one-time, dismissible notice on the profile page:
```
ℹ️  Your Strava profile shows a weight of {X} kg.
    Your BestBikeFit4U weight is {Y} kg.
    [Update to {X} kg]  [Keep {Y} kg]
```

"Update" calls `upsertProfile({ weightKg: stravaWeight })` and triggers the tire pressure recalculate dialog (from `plans/feature-dashboard-ux-improvements/05-profile-weight-and-recalculate.md`).

Track that the prompt was shown using a flag — avoid showing it on every page load. Options:
- Store `stravaWeightPromptDismissedAt` in the integration record
- Or use localStorage with key `strava_weight_prompt_dismissed_{userId}`

## New Mutation: `importStravaPhoto`

```ts
// convex/integrations/mutations.ts
export const importStravaPhoto = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", q => q.eq("userId", userId).eq("provider", "strava"))
      .unique();

    if (!integration?.athleteAvatarUrl) {
      throw new Error("No Strava photo available");
    }

    await ctx.db.patch(userId, {
      profile_image_url: integration.athleteAvatarUrl,
      profileImageSource: "strava",
    });
  },
});
```

## ProfilePhotoUpload component update

File: `src/components/profile/ProfilePhotoUpload.tsx`

Read this file before editing. The component currently handles `source` prop and shows the photo. No changes needed to the component itself — the photo URL from Strava is a plain HTTPS CDN URL that `<img>` can display directly.

Ensure the Next.js `next.config.ts` image domains list includes Strava's CDN:
- `dgalywyr863hv.cloudfront.net` (primary Strava athlete photo CDN)
- `lh3.googleusercontent.com` (already likely present for Google photos)

## i18n Keys

```
settings.integrations.strava.photo.importButton
settings.integrations.strava.photo.previewTitle
settings.integrations.strava.photo.previewBody
settings.integrations.strava.photo.confirm
settings.integrations.strava.photo.cancel
settings.integrations.strava.photo.currentSource
settings.integrations.strava.weightPrompt.title
settings.integrations.strava.weightPrompt.update
settings.integrations.strava.weightPrompt.keep
```

## Acceptance Criteria

- [ ] User with no existing photo: Strava photo is automatically applied at connect time
- [ ] User with existing photo: prompt appears in settings; user can preview and choose
- [ ] "Import from Strava" button in settings always available when Strava is connected and has a photo
- [ ] Importing sets `profileImageSource = "strava"` on the users record
- [ ] Disconnecting Strava does NOT remove the profile photo
- [ ] Strava CDN domain added to Next.js allowed image domains
- [ ] Weight prompt appears once when Strava weight differs from profile weight by ≥ 1 kg
- [ ] Weight prompt is dismissible and does not reappear after dismissal
