# Output 04 — CSP and Security Headers Re-Check

Date: `2026-03-18`
Plan: `plans/security-audit-2026-q1`
Step: `04-csp-and-headers-recheck.md`

## 1. Current Security Headers

Source: `next.config.ts`

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | See below |

### CSP (production):
```
default-src 'self';
connect-src 'self' https://*.convex.cloud wss://*.convex.cloud;
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
frame-ancestors 'none'
```

### CSP (development only, connect-src relaxed):
```
connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:* https://*.convex.cloud wss://*.convex.cloud
```

---

## 2. Comparison vs. Original Audit Baseline

Original audit baseline (output-02-automated-security-baseline.md, section 3.4) documented:
- Present: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP.
- Gap: `unsafe-inline` in `script-src` and `style-src`.
- Note: GTM was previously loaded via inline `<script>` in `layout.tsx` (dangerouslySetInnerHTML).

**What changed since original audit:**
1. GTM script injection was migrated from a server-rendered `dangerouslySetInnerHTML` block to the `GTMConsentLoader` client component, which dynamically appends a `<script src="https://www.googletagmanager.com/...">` tag.
2. No new `unsafe-eval` was added.
3. No new `unsafe-inline` was added.
4. No new external origins were added to any directive.
5. `frame-ancestors 'none'` is present (equivalent to and correctly supplements `X-Frame-Options: DENY`).

**Headers status vs. original:** Unchanged or equivalent. No loosening detected.

---

## 3. P1 Finding: CSP Does Not Allow GTM Script Source

The migration of GTM from inline `<script>` to an external dynamic script load (`<script src="https://www.googletagmanager.com/gtm.js?id=...">`) introduced a functional gap:

- **Before:** GTM was injected as an inline script, which was permitted by `'unsafe-inline'` in `script-src`. (Security concern: broad; functional: worked.)
- **After:** GTM loads as an external script from `https://www.googletagmanager.com`. The current `script-src 'self' 'unsafe-inline'` does **not** whitelist `https://www.googletagmanager.com`, so browsers will block the external GTM script load with a CSP violation.

This means GTM is non-functional in production despite the consent mechanism being correctly implemented.

**Recommended fix:** Add `https://www.googletagmanager.com` to `script-src` and to `connect-src` (GTM makes fetch requests to the analytics endpoint). Also add `https://www.google-analytics.com` and `https://analytics.google.com` if GA4 tags are in the GTM container.

---

## 4. Prototyper UI — CSP Compatibility Check

**Inline styles:** Prototyper UI components (`Button.tsx`, `Card.tsx`, `AccessibleDialog.tsx`, `Tooltip.tsx`, `Progress.tsx`, etc.) use Tailwind CSS classes only. No `style={...}` inline style props that would need `unsafe-inline` in `style-src`. The existing `style-src 'self' 'unsafe-inline'` is sufficient and not tightened by these components.

**External fonts:** `globals.css` defines `--font-sans` using system fonts (`Inter, ui-sans-serif, system-ui, ...`). No `@font-face` rule loads from an external CDN. `font-src 'self'` is sufficient.

**External CSS imports:** `globals.css` starts with `@import "tailwindcss"`. This is resolved at build time by the PostCSS pipeline — it does not make a runtime `@import` request to an external URL.

**`@base-ui/react` primitives:** Render entirely via CSS classes. No runtime CDN requests. No additional CSP entries needed.

---

## 5. Image Sources Check

`next.config.ts` does not define `images.remotePatterns`. No Next.js `<Image>` component remote patterns are configured.

The CSP `img-src 'self' data: blob:` covers:
- Local images (`'self'`)
- Base64 data URIs (`data:`)
- Object URLs (`blob:`)

**Bike photo uploads:** Convex storage URLs are served from `*.convex.cloud`. The current `img-src` directive does not include `https://*.convex.cloud`, which means bike profile photos stored in Convex storage would be blocked if rendered via `<img src="...convex.cloud/...">` without Next.js image proxy.

Checking the codebase: `users.updateProfile` stores a `profile_image_url` field. If this is rendered directly in an `<img>` tag with a `convex.cloud` URL, it would be blocked by CSP.

**Finding P2:** `img-src` does not include `https://*.convex.cloud`. If any Convex storage image URLs are rendered directly (not proxied through Next.js `<Image>`), they will be blocked by CSP. Recommend adding `https://*.convex.cloud` to `img-src` to match the functional requirement.

---

## 6. Pass Criteria Assessment

| Criterion | Status | Notes |
|---|---|---|
| No new `unsafe-inline` or `unsafe-eval` | Pass | Headers unchanged |
| External image domains intentional and minimal | Pass with gap | `img-src` may need `*.convex.cloud` |
| `X-Frame-Options` present | Pass | `DENY` |
| `X-Content-Type-Options` present | Pass | `nosniff` |
| `Referrer-Policy` present | Pass | `strict-origin-when-cross-origin` |
| GTM functional under CSP | FAIL | `script-src` missing `googletagmanager.com` |

---

## 7. Findings Summary

| ID | Severity | Finding |
|---|---|---|
| CSP-01 | P1 | `script-src` missing `https://www.googletagmanager.com` — GTM externally loaded scripts are blocked |
| CSP-02 | P2 | `img-src` missing `https://*.convex.cloud` — Convex storage image URLs may be blocked in browser |
| CSP-03 | P3 | No HSTS configured at app layer (noted in original audit; still unresolved — typically set at edge/CDN) |
