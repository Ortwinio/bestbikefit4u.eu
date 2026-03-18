# 05 — Settings Page

## Goal

Create a `/settings` page that consolidates language selection, theme preference, account type display, and a sign-out action. Move the language switch out of the sidebar into settings.

## Background

Currently the language switcher lives in `DashboardSidebar.tsx` and the mobile header in `layout.tsx`. There is no settings page. Account type (`users.tier`) is not surfaced in the dashboard UI. Theme preference is added in prompt 01 but has no UI yet (theme switch UI comes in prompt 06). The current repo also may not have `src/components/auth/UserMenu.tsx`, so do not assume that file exists.

## Steps

### 1. Create `/settings` page

Create `src/app/(dashboard)/settings/page.tsx`.

The page has four sections rendered as tabs or stacked cards:

**A. Account**
- Profile photo (link to profile photo section, or inline upload via `ProfilePhotoUpload` from prompt 02)
- Display name and email (read-only, from current user)
- Account type badge: "Free" or "Pro" (from `users.tier`)
- If `tier === "free"`: show an upgrade prompt card ("Upgrade to Pro for multiple bikes, Strava sync, and advanced pressure insights")
- Sign out button (same logic as existing sign-out in sidebar)

**B. App preferences**
- Language selector — move the existing `LanguageSwitch` component here; remove it from the sidebar
- Appearance — placeholder for the theme switch UI (actual switch implemented in prompt 06); render the three options (Light / Dark / System) as disabled/inert for now so the layout is ready
- Units — metric / imperial radio group; persist preference only after first confirming there is no existing storage location. If missing, add `unit_preference: v.optional(v.union(v.literal("metric"), v.literal("imperial")))` to `users` and extend the user-preferences mutation from prompt 01

**C. Integrations**
- Strava section — placeholder card "Connect Strava" (button disabled, labeled "Coming soon"); actual implementation in prompt 12

**D. Privacy**
- Static links or toggles for data consent (can be informational for now)
- No backend required for this section in this prompt

### 2. Add settings link to navigation

In `DashboardSidebar.tsx`:
- Add a "Settings" navigation item (Settings/Cog icon) pointing to `/settings`
- Keep the `LanguageSwitch` component in place until the settings-page version is working, then remove it in the same change to avoid a temporary locale-switch regression

In `layout.tsx` (mobile menu):
- Add "Settings" to the mobile nav list
- Keep the mobile `LanguageSwitch` until the settings-page replacement is verified, then remove it in the same change

### 3. Add settings link to UserMenu

If `src/components/auth/UserMenu.tsx` exists, add a "Settings" link item there. If it does not exist, skip this step and document that settings entry points are sidebar + mobile nav only.

### 4. Schema update (if units field missing)

If `unit_preference` is not already in the schema, add it to `convex/schema.ts` under `users`:
```ts
unit_preference: v.optional(v.union(v.literal("metric"), v.literal("imperial"))),
```

And extend the user-preferences mutation from prompt 01 to accept this field.

### 5. i18n

Add translation keys for the settings page sections, tabs, and all labels. Add to both locale files:
- `settings.title` — "Settings"
- `settings.account.title` — "Account"
- `settings.account.type` — "Account type"
- `settings.account.free` — "Free"
- `settings.account.pro` — "Pro"
- `settings.account.upgrade` — "Upgrade to Pro"
- `settings.preferences.title` — "Preferences"
- `settings.preferences.language` — "Language"
- `settings.preferences.appearance` — "Appearance"
- `settings.preferences.units` — "Units"
- `settings.preferences.metric` — "Metric (kg, mm)"
- `settings.preferences.imperial` — "Imperial (lbs, inches)"
- `settings.integrations.title` — "Integrations"
- `settings.integrations.strava` — "Strava"
- `settings.integrations.stravaComingSoon` — "Coming soon"

## Acceptance Criteria

- [ ] `/settings` page exists with Account, Preferences, Integrations, and Privacy sections
- [ ] Language switch works from the settings page (same behavior as current sidebar switch)
- [ ] Language switch removed from sidebar and mobile header
- [ ] Account type badge ("Free" / "Pro") shown in settings
- [ ] Upgrade prompt shown for free users
- [ ] Settings link appears in sidebar and mobile nav
- [ ] Strava section shows "Coming soon" placeholder
- [ ] `npm run typecheck` passes
