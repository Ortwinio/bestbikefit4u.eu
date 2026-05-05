# Output 07 — Metadata Helper Rollout

## Helper structure

- Extended `src/i18n/metadata.ts` with `buildLocalizedAlternates` so route families can share one canonical/alternate builder even when EN and NL use different slugs.
- Kept `buildLocaleAlternates` as the default helper for normal localized routes.

## Route families migrated

- Programmatic tire-pressure routes migrated to `buildLocalizedAlternates`.
- Shared layout-level `Organization` and `WebSite` schema ownership was centralized in `src/app/layout.tsx`.

## Deviations kept intentionally

- No new one-size-fits-all helper was introduced for every page title/description because many public pages already rely on localized content modules or route-specific copy.
- Selective locale alternates on dedicated English-only or Dutch-only landing pages remain separate via `buildSelectiveLocaleAlternates`.

## Validation results

- Added unit coverage for the new alternates helper.
- SEO-focused test slice passed after rollout.
