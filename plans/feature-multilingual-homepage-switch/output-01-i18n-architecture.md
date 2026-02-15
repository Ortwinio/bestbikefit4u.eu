# Step 01 Output: i18n Architecture

## Scope Reviewed

Architecture decisions were based on the current app routing/layout/auth setup:

- Root layout and static `lang="en"`: `src/app/layout.tsx:18`
- Global proxy/auth middleware entry: `src/proxy.ts:1`
- Public layout shell: `src/app/(public)/layout.tsx:1`
- Homepage content + metadata: `src/app/(public)/page.tsx:13`
- Shared public chrome text/links:
  - `src/components/layout/Header.tsx:12`
  - `src/components/layout/Footer.tsx:9`
- Auth and dashboard absolute path usage:
  - `src/app/(auth)/layout.tsx:11`
  - `src/app/(auth)/login/page.tsx:34`
  - `src/app/(dashboard)/layout.tsx:18`
  - `src/components/layout/DashboardSidebar.tsx:17`

## Decision 1: Locale-Prefixed Routing

### Chosen Strategy

Use locale-prefixed routes for all user-facing pages:

- English: `/en/...`
- Dutch: `/nl/...`

### Why

1. Clear SEO/canonical structure for bilingual public pages.
2. Deterministic language switching (URL is source of truth).
3. Easier `hreflang` metadata implementation in later steps.
4. Works across homepage, auth, and dashboard with one pattern.

### Route Behavior Rules

1. `/` redirects to `/<preferred-locale>` (307).
2. Any non-prefixed user-facing route (for example `/about`, `/dashboard`) redirects to `/<preferred-locale><pathname>` while preserving query.
3. Paths already prefixed with `/en` or `/nl` continue normally.
4. API/static/internal paths are never locale-prefixed:
   - `/api/*`
   - `/_next/*`
   - Files with extensions (for example `.png`, `.ico`, `.xml`).

## Decision 2: Locale Negotiation and Persistence

### Fallback Order

`cookie -> Accept-Language -> en`

### Cookie Contract

- Name: `bf_locale`
- Values: `en | nl`
- Path: `/`
- Max-Age: `31536000` (1 year)
- SameSite: `lax`
- Secure: enabled in production

### Update Rules

1. When a user lands on a locale-prefixed URL, sync cookie to that locale.
2. When the language switch is used, navigate to same route under new locale and update cookie.
3. If cookie is missing/invalid, compute from `Accept-Language` and persist.

## Decision 3: Translation Catalog Structure and Typing

### Directory Layout

Use app-local i18n modules:

- `src/i18n/config.ts` (supported locales, default locale, type guards)
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/i18n/getDictionary.ts` (server dictionary loader)
- `src/i18n/navigation.ts` (locale-aware path helpers)

### Namespaces

Top-level namespaces for maintainability:

- `common` (buttons, shared labels)
- `nav` (header/footer/dashboard links)
- `home` (homepage sections and CTAs)
- `auth` (login flow copy)
- `dashboard` (dashboard shell/common copy)
- `errors` (not-found and shared error text)

### Type-Safety Rule

English catalog is source-of-truth shape:

- `type Messages = typeof en`
- Dutch catalog must `satisfies Messages`

This blocks missing keys at compile time for `nl` and avoids runtime key drift.

## Decision 4: Rendering and Component Boundary

1. Server components load dictionaries and pass string props to client components.
2. Client-heavy components (for example login/dashboard sidebar) should receive translated strings as props instead of owning translation state initially.
3. Root `<html lang>` must be driven by active locale (not hard-coded `en`).

## Migration Impact Map

## Phase A (Foundation)

1. Add i18n config, dictionary modules, and locale utilities in `src/i18n/`.
2. Introduce locale segment in app routes with `[locale]` container.
3. Keep existing providers/auth wrappers intact while moving page groups under locale.

## Phase B (Routing/Auth Integration)

1. Update `src/proxy.ts` to:
   - Handle locale negotiation and redirects.
   - Preserve Convex auth middleware behavior.
   - Protect localized dashboard routes (`/en/dashboard...`, `/nl/dashboard...`).
2. Redirect unauthenticated localized dashboard access to localized login route (`/{locale}/login`).

## Phase C (Content/Link Conversion)

1. Replace hard-coded root-relative links with locale-aware helper usage.
2. Translate homepage and shared public chrome first.
3. Expand to auth/dashboard and remaining public pages in follow-up steps.

## Auth/Proxy Risk Register and Mitigations

1. Risk: protected route matcher only covers `/dashboard(.*)` (`src/proxy.ts:7`).
   Mitigation: match both unprefixed legacy and locale-prefixed dashboard paths during migration.

2. Risk: unauth redirect currently points to `/login` (`src/proxy.ts:12`).
   Mitigation: compute redirect target from resolved locale and use `/{locale}/login`.

3. Risk: client redirects hard-code `/login` and `/dashboard`:
   - `src/app/(dashboard)/layout.tsx:18`
   - `src/app/(auth)/login/page.tsx:34`
   - `src/app/(auth)/login/page.tsx:65`
   Mitigation: centralize locale-aware path construction and apply in client navigation calls.

4. Risk: sign-out currently pushes `/` (`src/components/layout/DashboardSidebar.tsx:33`), which may lose explicit locale.
   Mitigation: push `/{activeLocale}` post sign-out.

5. Risk: many absolute `href="/..."` links can drop locale context.
   Mitigation: introduce locale path helper and migrate link usage incrementally, starting with header/footer/homepage.

## Step 02 Execution Notes

Implementation order for Step 02:

1. Add locale config + typed dictionaries.
2. Build locale parser (`cookie` + `Accept-Language`) and path helper.
3. Add locale route segment and move homepage/public route entrypoints.
4. Update proxy logic for redirects + auth protection on localized routes.
5. Set `<html lang>` from active locale.
