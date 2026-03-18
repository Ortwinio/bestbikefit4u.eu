# 06 — Dark / Light / System Theme Switch

## Goal

Implement a working Light / Dark / System theme switcher that persists the user's preference to Convex and applies immediately without a page reload.

## Background

After prompt 01, `users.theme_preference` exists in the schema. After prompt 05, the settings page has a placeholder for the appearance switch. This prompt wires it up.

The app uses Tailwind and a shared UI layer. Do not assume a separate Prototyper UI migration is already present; the `.dark` class on `<html>` remains the source of truth for dark mode activation.

**Persistence strategy:**
- Logged-in users: persist to `users.theme_preference` via the user-preferences mutation from prompt 01
- Guest / pre-login: persist to `localStorage` key `"theme"` as fallback
- Apply on page load via a small inline script in `layout.tsx` to prevent flash of wrong theme

## Steps

### 1. Create the theme provider

Create `src/components/providers/ThemeProvider.tsx`:
- Client component
- Reads initial theme from: Convex `users.theme_preference` (if logged in) → `localStorage` → `"system"` default
- Applies `.dark` class to `document.documentElement` based on resolved theme:
  - `"light"` → remove `.dark`
  - `"dark"` → add `.dark`
  - `"system"` → match `prefers-color-scheme: dark` using `window.matchMedia`
- Listens to `prefers-color-scheme` changes when in system mode
- Exposes `theme`, `setTheme` via React context
- When `setTheme` is called: applies immediately, saves to `localStorage`, and if logged in, calls the user-preferences mutation

Export a `useTheme()` hook.

### 2. Add the inline script to prevent flash

In `src/app/layout.tsx`, add a `<script>` tag (dangerouslySetInnerHTML) in `<head>` before any styles:
```js
(function() {
  var t = localStorage.getItem('theme') || 'system';
  if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();
```

### 3. Wrap the app in ThemeProvider

In `src/app/layout.tsx` (or the root provider file), wrap children with `<ThemeProvider>`.

If there is an existing provider hierarchy (`ConvexAuthNextjsServerProvider`, etc.), add `ThemeProvider` inside the client boundary, after auth is established so it can read the user's saved preference.

### 4. Build the ThemeToggle component

Create `src/components/ui/ThemeToggle.tsx`:
- Three-option segmented control: "Light" | "Dark" | "System"
- Uses the `useTheme()` hook to read and set theme
- Renders sun / moon / monitor icons (from `lucide-react`)

### 5. Wire into settings page

In `src/app/(dashboard)/settings/page.tsx`, replace the placeholder appearance row with `<ThemeToggle>`.

### 6. i18n

Add translation keys:
- `settings.preferences.light` — "Light"
- `settings.preferences.dark` — "Dark"
- `settings.preferences.system` — "System"

## Acceptance Criteria

- [ ] Switching to Dark applies `.dark` class immediately, no page reload
- [ ] Switching to System tracks `prefers-color-scheme` changes
- [ ] Preference persists across page reloads via `localStorage`
- [ ] Logged-in users have preference saved to `users.theme_preference` in Convex
- [ ] No flash of wrong theme on initial load (inline script in `<head>`)
- [ ] ThemeToggle renders in the settings page
- [ ] `npm run typecheck` passes
