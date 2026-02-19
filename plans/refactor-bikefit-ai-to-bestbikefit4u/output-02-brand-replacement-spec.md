# Output 02: Brand Replacement Specification

Date: `2026-02-19`
Plan step: `02-define-replacement-rules-and-brand-core.md`

## Canonical Brand Core

The following values are the canonical identity for active product surfaces.

| Key | Canonical Value | Notes |
|------|------|------|
| Product name | `BestBikeFit4U` | Primary display brand in UI, SEO, emails, PDFs |
| Legacy name | `BikeFit AI` | Migration-only token; should not appear in active app surfaces |
| Primary site URL | `https://bestbikefit4u.eu` | Already present in env/deployment docs |
| Site host | `bestbikefit4u.eu` | Canonical domain for links and mail defaults |
| Auth/report sender | `BestBikeFit4U <noreply@bestbikefit4u.eu>` | Replaces BikeFit AI sender display name |
| Default app title | `BestBikeFit4U` | Replaces `BikeFit AI` in root metadata |
| SEO OG site name | `BestBikeFit4U` | Use in structured data and OpenGraph name fields |
| Default report title | `BestBikeFit4U - Fit Recommendation Report` | Replaces PDF/report label |
| Report filename slug | `bestbikefit4u-report` | Replaces `bikefit-report` |

Decision:

- `package.json` package name remains `bikefit-ai` for now (no functional/user-facing impact).

## Additional Legacy Tokens To Replace

Step 01 tracked `BikeFit AI` directly. A broader scan for `bikefit` variants found additional migration tokens:

- `BikeFIT` (casing variant in tooltip/help copy)
- `support@bikefitai.com` (contact/privacy/terms)
- `bikefit-report-...` (download filename pattern)

These must be included in replacement rules to avoid residual legacy identity.

## Centralized Brand Configuration Design

Implement a single frontend brand module, plus a backend module for Convex runtime usage.

### Frontend core

- Add `src/config/brand.ts` with a typed `BRAND` object.
- Import this module in:
  - `src/app/layout.tsx`
  - i18n message composition points
  - SEO metadata builders
  - report/PDF helpers under `src/lib/*`

Recommended shape:

```ts
export const BRAND = {
  name: "BestBikeFit4U",
  legacyName: "BikeFit AI",
  siteUrl: "https://bestbikefit4u.eu",
  host: "bestbikefit4u.eu",
  authEmailFrom: "BestBikeFit4U <noreply@bestbikefit4u.eu>",
  supportEmail: "support@bestbikefit4u.eu",
  reportTitle: "BestBikeFit4U - Fit Recommendation Report",
  reportSlug: "bestbikefit4u-report",
} as const;
```

### Convex backend core

- Add `convex/lib/brand.ts` for auth/email templates.
- Use this module in:
  - `convex/auth.ts`
  - `convex/emails/actions.ts`

Rationale:

- Next.js and Convex have different runtime boundaries; separate modules avoid import-path/runtime coupling.

## Replacement Rules

## Rule Group A: Safe exact replacements

1. `BikeFit AI` -> `BestBikeFit4U`
2. `BikeFIT` -> `BestBikeFit4U` (or localized equivalent in sentence context)
3. `BikeFit AI - Fit Recommendation Report` -> `BestBikeFit4U - Fit Recommendation Report`
4. `bikefit-report-` -> `bestbikefit4u-report-`

Apply to:

- UI text, metadata titles/descriptions, email subjects/bodies, PDF labels, test assertions.

## Rule Group B: Domain/email replacements

1. `noreply@bestbikefit4u.eu` stays unchanged.
2. Sender display name:
   - `BikeFit AI <noreply@bestbikefit4u.eu>` -> `BestBikeFit4U <noreply@bestbikefit4u.eu>`
3. Support email:
   - `support@bikefitai.com` -> `support@bestbikefit4u.eu`

Operational note:

- Ensure mailbox provisioning/forwarding exists for `support@bestbikefit4u.eu` before release cutover.

## Rule Group C: Contextual/manual replacements (no blind global replace)

1. Legal content (`terms`, `privacy`) should preserve legal meaning; replace entity name only.
2. SEO copy should preserve keyword intent while replacing brand term.
3. Science pages using generic phrase `Bike Fit` as topic should remain unchanged when not referring to brand.
4. Localized strings:
   - EN: `Sign in to BestBikeFit4U`
   - NL: `Log in bij BestBikeFit4U`
   - Avoid mixed variants (`BikeFIT`, `BikeFit AI`) after migration.

## Rule Group D: Package and internal identifiers

1. Keep `package.json` `"name": "bikefit-ai"` for this migration.
2. Do not rename algorithm comments/types where `Bike Fit` is generic domain language.

## Exceptions (Allowed Legacy References)

The following may retain historical references:

- Archived/historical outputs in `plans/**/output-*.md`
- Historical context documents where references describe past state
- Git history, commit messages, and release notes already published

The following are not exceptions and must be updated:

- `src/**`
- `convex/**`
- active deployment docs and env templates (`docs/VERCEL_DEPLOYMENT.md`, `.env.example`)
- active tests coupled to user-facing strings

## File-Level Execution Map

Step 03 (frontend + SEO focus):

- `src/app/layout.tsx`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/app/(public)/**/*`
- `src/app/(auth)/**/*`
- `src/components/layout/**/*`

Step 04 (backend + reports + env/docs/tests):

- `convex/auth.ts`
- `convex/emails/actions.ts`
- `src/lib/reports/recommendationPdf.ts`
- `src/lib/pdf/simplePdf.ts`
- `src/app/api/reports/[sessionId]/pdf/route.ts`
- `src/app/api/reports/[sessionId]/pdf/route.test.ts`
- `.env.example`
- `docs/VERCEL_DEPLOYMENT.md`

## Verification Queries (Post-implementation)

Must be clean in active surfaces:

```bash
rg -n "BikeFit AI|BikeFIT|support@bikefitai.com" src convex .env.example docs
```

Expected review-needed only:

```bash
rg -n "bikefit-ai" package.json
```

Filename slug migration check:

```bash
rg -n "bikefit-report-" src
```

## Completion Criteria For This Spec

- Canonical brand constants are explicitly defined.
- Centralization design is defined for frontend and Convex runtimes.
- Replacement and exception rules are unambiguous, including non-exact legacy tokens.
- Step 03 and Step 04 now have a deterministic implementation contract.
