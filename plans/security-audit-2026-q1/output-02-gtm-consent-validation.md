# Output 02 — GTM Consent Validation

Date: `2026-03-18`
Plan: `plans/security-audit-2026-q1`
Step: `02-gtm-consent-validation.md`

## 1. Consent Flow

```
Page load (SSR)
  └─ RootLayout renders GTMConsentLoader (client component)
       └─ useSyncExternalStore: server snapshot returns null → no GTM on SSR

Client hydration
  └─ useSyncExternalStore reads from document.cookie / localStorage
       └─ if consent === null:  GTM never loads; CookieConsentBanner is shown
       └─ if consent === "essential":  GTM never loads; banner is hidden
       └─ if consent === "accepted":  GTM loads once via dynamic <script> injection

User interaction
  └─ CookieConsentBanner dispatches COOKIE_CONSENT_EVENT on choice
       └─ subscribeToCookieConsent listener fires → re-render
       └─ if "accepted": GTM loads (window.__bfGtmLoaded prevents double-load)
       └─ if "essential": GTM does not load
```

**Consent state storage:** Cookie `bf_cookie_consent` (SameSite=Lax; Max-Age=1 year) AND `localStorage` key `bf_cookie_consent`. Both are written together in `writeCookieConsent`. Reads prefer cookie, fall back to localStorage.

**GTM container ID:** `GTM-KH48ZSSC` (hardcoded in `src/app/layout.tsx`). This is normal practice; the container ID is public.

---

## 2. Bypass Risk Assessment

### 2.1 Server-Side Render Race

**Finding:** No bypass risk.

The `GTMConsentLoader` uses `"use client"` directive. On SSR, `useSyncExternalStore` receives the third argument (server snapshot) which returns `null`. The `useEffect` that injects the GTM script only runs client-side. GTM is never included in the SSR output.

### 2.2 First-Render Flash (Client)

**Finding:** No bypass risk.

On first client render before hydration completes, `useSyncExternalStore` reads the cookie synchronously via `readCookieConsent`. If the cookie is already set to `"accepted"`, GTM loads on first render. This is the correct behaviour — it means returning users who previously consented will load GTM immediately, not through a flash.

### 2.3 Manually Setting the Consent Cookie

**Finding:** Expected behaviour, not a bypass.

If a user manually sets `document.cookie = "bf_cookie_consent=accepted"` they are explicitly granting consent. The system honours this, which is consistent with GDPR intent.

If a user manually clears the consent cookie, `readCookieConsent` returns `null`, the banner re-appears, and GTM is not loaded (because `__bfGtmLoaded` is not set if GTM was never loaded in this session). However if GTM was loaded earlier in the same session and the cookie is cleared, `window.__bfGtmLoaded` remains `true` and GTM continues to operate for the remainder of the session. This is a minor hygiene gap (P3) — GTM does not unload itself at runtime.

### 2.4 Coverage of Analytics Events

**GTM (tag-based tracking):** Correctly gated — only loads when `consent === "accepted"`.

**`MarketingEventTracker` (Convex mutation-based events):** Checks `canTrackMarketing()` before calling `logMarketingEvent`. `canTrackMarketing()` calls `readCookieConsent()` at the moment of the event, so it is current. No bypass.

**`TrackedCtaLink`:** Same pattern — checks `canTrackMarketing()` in the click handler before logging. No bypass.

**Result:** All three analytics paths are correctly gated on consent.

### 2.5 Scripts Loaded Outside GTM

No third-party analytics scripts are loaded outside of the GTM consent mechanism. The only other script in `layout.tsx` is the theme-detection inline script (`dangerouslySetInnerHTML`), which does not load analytics.

---

## 3. GDPR Alignment

| Criterion | Status | Notes |
|---|---|---|
| Opt-in (not opt-out) | Pass | Banner requires explicit action; no pre-selected "Accept" |
| Two meaningful choices | Pass | "Essential only" and "Accept all" — no dark pattern |
| Consent before tracking | Pass | GTM only fires after "Accept all" click |
| Consent persisted | Pass | Cookie + localStorage, 1-year expiry |
| Withdraw consent | Partial | No explicit "Withdraw" UI once banner is dismissed. A user would need to clear cookies/localStorage manually. Counts as a P2 gap for GDPR compliance. |
| Consent logged/auditable | Gap | Consent choice is not stored server-side (only in client cookie/localStorage). There is no audit trail of when consent was granted or withdrawn. P2 for auditability. |
| Consent covers purpose | Pass | Banner text explicitly mentions analytics; privacy policy link provided |

---

## 4. CSP Interaction with GTM

**P1 Finding:** The current `script-src` directive is `'self' 'unsafe-inline'`. This allows inline scripts but does **not** allow loading scripts from `https://www.googletagmanager.com`. The dynamic `<script src="https://www.googletagmanager.com/gtm.js?id=...">` created by `GTMConsentLoader` would be blocked by a compliant browser CSP enforcement, because external script sources require explicit inclusion in `script-src`.

**Impact:** GTM is functionally disabled by the CSP even for consenting users. Analytics data is not collected despite the consent mechanism working correctly. This is a functional gap rather than a security regression (the CSP is correctly preventing a new external origin), but it needs to be resolved to restore intended analytics functionality.

**Recommended fix:** Add `https://www.googletagmanager.com` to `script-src` and `connect-src` in `next.config.ts`. Also add `https://www.google-analytics.com` if GA4 tags are configured in the GTM container.

---

## 5. Findings Summary

| ID | Severity | Finding |
|---|---|---|
| GTM-01 | P1 | CSP `script-src` missing `https://www.googletagmanager.com` — GTM blocked even for consenting users |
| GTM-02 | P2 | No server-side consent audit trail — consent is client-only, not logged |
| GTM-03 | P2 | No in-app "Withdraw consent" UI — users must clear cookies manually |
| GTM-04 | P3 | GTM does not unload mid-session if consent is revoked — active session continues until reload |
| GTM-05 | P3 | Consent cookie missing `Secure` flag — could be sent over HTTP connections (carried over from original audit P3 backlog) |
