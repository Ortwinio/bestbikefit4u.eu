# Findings: Convex Mutation and Query Audit

## Audit Table

| Module | Has auth? | Auth helper | Notes |
|--------|-----------|-------------|-------|
| `profiles/mutations.ts` | Yes | `requireUserId` | Ownership checked |
| `bikes/mutations.ts` | Yes | `requireBikeOwner` / `requireUserId` | Ownership checked |
| `bikeProfiles/mutations.ts` | Yes | `requireBikeProfileOwner` / `requireBikeOwner` | Ownership checked |
| `sessions/mutations.ts` | Yes | `requireUserId` + session check | Ownership checked |
| `recommendations/mutations.ts` | Yes | `requireRecommendationOwner` | Ownership checked |
| `recommendations/actions.ts` | Yes | `requireSessionOwner` (internal) | Internal action, uses internal mutation |
| `questionnaire/mutations.ts` | Yes | `requireSessionOwner` | Ownership checked |
| `fitPass/queries.ts` | Yes | `getAuthUserId` + ownership | Ownership checked |
| `stripe/mutations.ts` | Yes (internal) | `internalMutation` | Not publicly callable |
| `gearing/mutations.ts` | Yes | `requireBikeOwner` | Ownership checked |
| `saddleWidth/mutations.ts` | Yes | `requireUserId` | Ownership checked |
| `geometry/queries.ts` | Public (read-only) | None | Public geometry library — by design |
| `guides/mutations.ts` | Yes | `requireGuideEditor` / `requireGuideAdmin` | Admin-gated; see below |
| `guides/queries.ts` | Mixed | Auth on drafts | Published guides public — by design |
| `marktplaats/mutations.ts` | Yes | `requireUserId` | Ownership checked |
| `marktplaats/actions.ts` | Yes | `requireUserId` (via mutation) | Scrapes external URL per user |
| `feedback/mutations.ts` | Partial | `getAuthUserId` (optional) | Anonymous allowed by design; `upvoteFeedbackItem` requires auth |
| `caseStudyLeads/mutations.ts` | Partial | `getAuthUserId` (optional) | **See F-04** |
| `analytics/mutations.ts` | Partial | `getAuthUserId` (optional) | Anonymous events allowed; has inline rate limiting |
| `users/mutations.ts` | Yes | `requireUserId` | Ownership checked |
| `users/queries.ts` | Yes | `getAuthUserId` | Returns only current user's data |
| `messages/mutations.ts` | Yes | `requireUserId` | Ownership + targeting checked |
| `releases/queries.ts` | Yes (admin) | `requireAnyRole` | Admin-only |
| `admin/mutations.ts` | Yes | `requireAdminRole` | Admin-gated |
| `admin/actions.ts` | Yes | `requireAdminRole` (via internal mutation) | Admin-gated |
| `admin/queries.ts` | Yes | `requireAdminUserId` / `requireAnyRole` | Admin-gated |
| `emails/actions.ts` | Yes (internal) | `internalAction` | Not publicly callable |
| `system/queries.ts` | Yes | `getAuthUserId` | Returns `{}` for unauthenticated callers |
| `rideFeedback/mutations.ts` | Yes | `requireUserId` | Ownership checked |
| `validationCaptures/mutations.ts` | Yes | `requireSessionOwner` | Ownership + feature-flag gated |
| `files/actions.ts` | Yes | `requireUserId` | Ownership checked |
| `wheelsets/mutations.ts` | Yes | `requireBikeOwner` | Ownership checked |
| `tireSetups/mutations.ts` | Yes | `requireBikeOwner` | Ownership checked |
| `pressureCalculations/mutations.ts` | Yes | `requireBikeOwner` | Ownership checked |
| `pressureProfiles/mutations.ts` | Yes | `requireBikeOwner` | Ownership checked |
| `bikeImports/mutations.ts` | Yes | `requireUserId` | Ownership checked |
| `bikeImports/actions.ts` | Yes | `requireUserId` (via internal) | Ownership checked |
| `bikePhotos/mutations.ts` | Yes | `requireBikeOwner` | Ownership checked |
| `integrations/mutations.ts` | Yes (internal) | `internalMutation` | Not publicly callable |
| `integrations/actions.ts` | Yes | `requireUserId` | Ownership checked |
| `integrations/queries.ts` | Yes | `requireUserId` | Ownership checked |

---

## Findings

### [MEDIUM] F-04: `caseStudyLeads/submit` — unauthenticated, triggers emails, no rate limiting

**Status**: Fixed

**Resolved in**: `convex/caseStudyLeads/mutations.ts`

**Original location**: `convex/caseStudyLeads/mutations.ts:13`

**Original issue**: The `submit` mutation allowed anonymous submissions and scheduled two email sends per call with no rate limiting.

**Fix**: A token-bucket limiter now uses the `authRateLimits` table with a 3-per-hour budget keyed by normalized email before the lead is inserted or any email jobs are scheduled.

**Residual risk**: This still rate-limits by email rather than IP, so a determined attacker can rotate addresses. A CAPTCHA or IP-aware limiter would be a stronger follow-up if abuse appears in production.

---

### [LOW] F-05: `updateGuide` — `seoHints` field accepts `v.any()`

**Status**: Fixed

**Resolved in**: `convex/guides/shared.ts`, `convex/guides/mutations.ts`, `convex/schema.ts`

**Original location**: `convex/guides/mutations.ts:133`

**Original issue**: `seoHints: v.optional(v.any())` accepted arbitrary nested data with no shape validation.

**Fix**: `seoHints` now uses a typed validator with the current supported shape: `{ funnel?: string }`. The write validators and schema are aligned.

---

### [LOW] F-06: `system/queries.getFeatureFlags` — public, no auth

**Status**: Fixed

**Resolved in**: `convex/system/queries.ts`

**Location**: `convex/system/queries.ts:3`

**Issue**: Feature flags are returned without any authentication. This exposes which features are currently active (e.g., engine_v2_enabled, beta_feature_x) to any unauthenticated caller, including competitors or researchers probing the API.

**Fix**: The query now requires an authenticated user context and returns an empty object for unauthenticated callers.

---

## Rate Limiting Coverage

| Mutation / Action | Rate limited? | Notes |
|-------------------|---------------|-------|
| Email verification (`authRateLimit`) | Yes | 3 / 15 min per email |
| `analytics.logMarketingEvent` | Yes | Inline token-bucket per user/event |
| `reportRateLimit.consumeReportRateLimitToken` | Yes | Rate limits PDF generation |
| `caseStudyLeads.submit` | Yes | 3 / hour per normalized email |
| `feedback.submitFeedback` | No | Anonymous allowed; low risk (no emails) |
| All authenticated mutations | N/A | Auth is the natural gate |

---

## CMS Guide Mutations — Specific Checks

| Mutation | Required auth | Correct? |
|----------|---------------|----------|
| `createGuide` | `requireGuideEditor` | Yes |
| `updateGuide` | `requireGuideEditor` | Yes |
| `publishGuide` | `requireGuideAdmin` | Yes |
| `unpublishGuide` | `requireGuideAdmin` | Yes |
| `changeSlug` | `requireGuideAdmin` | Yes |
| `addRedirect` | `requireGuideAdmin` | Yes |
| `deleteRedirect` | `requireGuideAdmin` | Yes |
| `submitGuideForReview` | `requireGuideEditor` | Yes |
| `requestGuideChanges` | `requireGuideAdmin` | Yes |
| `importGuide` | `internalMutation` | Yes |

All CMS guide mutations are correctly gated at the appropriate role level.

---

## Internal Actions Used as Public Actions

No instances found. All actions that should be internal are declared as `internalAction` or `internalMutation`. No public `action(...)` found that should be internal.
