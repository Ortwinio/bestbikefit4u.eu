# 40f — Locale-aware site and app metadata

- Root description, Open Graph/Twitter descriptions and WebSite JSON-LD now use the request locale and owner dictionary `src/i18n/marketing/siteMetadata.ts`. Brand titles/assets remain unchanged.
- `/nl/app` has its own Dutch title, description and social metadata; `/en/app` keeps the existing inherited English metadata. Existing app UI/auth/install behavior is untouched.
- Replaced the file-based `manifest.ts` route with an explicit GET handler at the same `/manifest.webmanifest` URL. Root metadata selects `?locale=nl` or `?locale=en`, so manifest language does not depend on cookies being sent by the browser. Next's file-based manifest override would otherwise override the explicit locale URL, which is why the old metadata-route file is removed.
- Manifest description, `lang` and localized start URL match the selected language. Stable `id: "/"`, root scope, existing brand/icons/colors and standalone behavior are preserved. Legacy URLs without a valid locale fall back to the request locale. Private/no-store responses prevent a cached language from leaking into another locale.
- English description copy remains exactly `Precision bike fitting for comfort, alignment, and performance.` No frozen dictionary edits.

## Validation

- `npx vitest run src/app/site-metadata.test.tsx src/app/app/page.test.tsx --maxWorkers=1`: **10 tests PASS**. Covers both languages, root/social/schema copy, app inheritance, explicit manifest locale overriding cookies, legacy/invalid locale fallback, stable app identity/icons and existing app redirects.
- Owned ESLint: **PASS**. `npx next typegen` regenerated route declarations after the new app layout/manifest handler.
- Shared `npm run typecheck` / full lint are currently blocked only by D's in-progress `BikeWheelsetEditor.tsx` (string-to-ID callback typing and missing tooltip registration). No ownership override or unrelated repair performed.
- Live local runtime check: **2/2 locales PASS** against the existing Next development server, GET only. Actual HTML has the expected title/description/social/schema language and exactly one localized manifest link; both manifest endpoints return 200 with the correct language/start URL/description. Proof: `audit/40f-runtime.json`; runner: `tests/visual/site-metadata/check.mjs`.

Exact file list: `audit/files-40f.txt`. No commit, deployment or production write.
