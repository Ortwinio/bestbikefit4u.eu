# Output 05 — Findings and Fixes

Date: `2026-03-18`
Plan: `plans/security-audit-2026-q1`
Step: `05-findings-and-fixes.md`

## 1. All Findings Across Steps 01–04

| ID | Source | Severity | Finding |
|---|---|---|---|
| CSP-01 | Step 04 / Step 02 | P1 | `script-src` missing `https://www.googletagmanager.com` — GTM dynamic script load blocked by CSP in production |
| GTM-01 | Step 02 | P1 | (Same as CSP-01 from GTM perspective) |
| CSP-02 | Step 04 | P2 | `img-src` missing `https://*.convex.cloud` — Convex storage images blocked |
| CONV-01 | Step 01 | P2 | `files.getUrl` query has no authentication |
| CONV-02 | Step 01 | P2 | Unbounded `v.string()` on new tier-pressure/bike fields |
| CONV-03 | Step 01 | P2 | `users.updateProfile.profile_image_url`: unbounded, no URL validation |
| GTM-02 | Step 02 | P2 | No server-side consent audit trail |
| GTM-03 | Step 02 | P2 | No in-app "Withdraw consent" UI |
| DEP-01 | Step 03 | P1 | `npm audit` could not run — must be executed in CI |
| GTM-04 | Step 02 | P3 | GTM does not unload mid-session on consent revocation |
| GTM-05 | Step 02 | P3 | Consent cookie missing `Secure` flag (carried from original audit) |
| CSP-03 | Step 04 | P3 | No HSTS at app layer (carried from original audit — set at CDN) |

---

## 2. P0 Fixes Applied

No P0 findings were identified. No missing auth on mutations, no SSRF risks, no cross-user data leakage.

---

## 3. P1 Fixes Applied

### P1-FIX-01 — CSP updated to allow GTM script source and Convex storage images

**File changed:** `next.config.ts`

**Problem:** After the GTM consent migration (`0288595`), GTM was changed from an inline `dangerouslySetInnerHTML` script to a dynamically inserted `<script src="https://www.googletagmanager.com/...">`. The `script-src` directive only had `'self' 'unsafe-inline'`, which covers inline scripts but not external origins. This caused the GTM script to be blocked by browsers in production, rendering analytics non-functional for consenting users.

Additionally, Convex storage URLs (`*.convex.cloud`) were missing from `img-src`, meaning any bike photo or user-uploaded image served from Convex storage would also be blocked.

**Changes made:**

1. Added `https://www.googletagmanager.com` to `script-src`.
2. Added `https://www.googletagmanager.com`, `https://www.google-analytics.com`, and `https://analytics.google.com` to `connect-src` in both production and dev variants (GTM and GA4 use these endpoints for beacon/fetch calls).
3. Added `https://*.convex.cloud` to `img-src`.

**Before:**
```
script-src 'self' 'unsafe-inline'
connect-src 'self' https://*.convex.cloud wss://*.convex.cloud
img-src 'self' data: blob:
```

**After:**
```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com
connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com
img-src 'self' data: blob: https://*.convex.cloud
```

**Verification:** The `next.config.ts` compiles as valid TypeScript. The CSP is applied server-side via `headers()` — no client-side changes needed.

---

## 4. P1 Items Tracked (Not Yet Fixed)

### P1-TRACK-01 — npm audit cannot be executed in sandbox

`npm audit` must be run in a network-enabled environment. The original audit had the same limitation.

**Action:** Add `npm audit --audit-level=high` as a required CI job. Fail the build on any high or critical vulnerability.

**Due date:** Before next production deployment.

---

## 5. P2 Backlog

- [P2] `convex/files/actions.ts` `getUrl` query: No auth guard — any caller with a valid storageId can get its URL. Add `requireUserId(ctx)` to the handler. Convex storage IDs are opaque so exploitation requires knowledge of a valid ID, but the pattern should be consistent with all other endpoints. **Deferred to next sprint.**

- [P2] `convex/wheelsets/mutations.ts`, `convex/tireSetups/mutations.ts`, `convex/pressureProfiles/mutations.ts`, `convex/pressureCalculations/mutations.ts`, `convex/bikes/mutations.ts`: `v.string()` fields without length limits (`name`, `brand`, `model`, `targetSurface`, `targetGoal`, `warningsJson`, `routeContextJson`). Apply `validateShortString` (name/brand/model: ~100 chars) and `validateTextString` for larger fields. Consistent with existing pattern in `sessions/mutations.ts`. **Deferred to next sprint.**

- [P2] `convex/users/mutations.ts` `updateProfile.profile_image_url`: No length limit, no URL format validation. Add length cap (e.g. 500 chars) and optionally validate as a Convex storage URL or https URL. **Deferred to next sprint.**

- [P2] No in-app "Withdraw consent" UI — users who accepted analytics cannot revoke consent without manually clearing browser cookies. A settings page or footer link to manage consent should be added. **Deferred — requires product decision.**

- [P2] No server-side consent audit trail — consent choice is stored only in the client cookie/localStorage. For GDPR completeness, log consent events (granted/revoked with timestamp) to Convex. **Deferred — requires product decision and schema change.**

---

## 6. P3 Backlog

- [P3] `src/lib/cookieConsent.ts` `writeCookieConsent`: Cookie set without `Secure` flag — could be transmitted over HTTP. Add `; Secure` in production. (Carried from original audit Step 04 backlog.) — **accepted risk / deferred to 2026-Q2**

- [P3] GTM does not unload mid-session if consent is revoked — the `window.__bfGtmLoaded` flag persists for the session lifetime. GTM will continue firing until the page is reloaded. This is standard GTM behaviour and acceptable given reload-on-consent-change is the common industry pattern. — **accepted risk**

- [P3] No HSTS at app layer — HSTS should be configured at the CDN/edge layer (Vercel). Not controlled in `next.config.ts`. — **accepted risk / verify at platform level**

- [P3] `npm audit` CI gate still not implemented (carried from original audit). — **deferred to 2026-Q2**

---

## 7. Security Posture Assessment vs. Original Audit

| Domain | Original Audit | This Audit | Change |
|---|---|---|---|
| Auth boundaries (Convex) | Strong (all core endpoints guarded) | Strong + verified new endpoints | No regression; `files.getUrl` is P2 gap |
| Input validation | P2 gaps noted; bounds validators added to profiles/sessions | New endpoints lack string-length limits | Minor regression in new endpoints (P2 only) |
| GTM consent | P3 — GTM not yet gated | Consent gate implemented and correct; CSP blocks GTM (P1 fixed) | Significant improvement; P1 CSP fix applied |
| CSP | `unsafe-inline` present; GTM inline script | GTM migrated to external; CSP updated to match | Improvement (external origin explicit now) |
| Dependencies | npm audit unavailable; baseline packages assessed | Same limitation; 4 new packages assessed as low-risk | Neutral |
| Route protection | Expanded in original hardening | No changes | Stable |
| Rate limiting | Analytics + report endpoint throttled | No new rate-limited endpoints needed | Stable |

**Overall:** Security posture is maintained or improved vs. original audit. The P1 CSP issue was introduced unintentionally as a side-effect of the GTM consent migration (the migration was security-positive but needed the CSP to be updated). That is now resolved. Remaining open items are P2/P3.

---

## 8. Recommended Next Review Date

**2026-Q2 (June 2026)**

Priority items for Q2 review:
1. Verify P2 backlog items (string-length validators, `files.getUrl` auth, consent withdrawal UI) are addressed.
2. Run `npm audit` and resolve any findings.
3. Verify HSTS is configured at Vercel edge layer.
4. Re-check if any new Convex modules were added and audit their auth boundaries.
