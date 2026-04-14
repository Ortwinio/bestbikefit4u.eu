# Findings: Dependency and Configuration Audit

## 1. npm audit

### Original audit output (summary)

```
9 vulnerabilities (3 moderate, 6 high)
```

**High severity:**

| Package | CVE | Description | Impact |
|---------|-----|-------------|--------|
| `rollup` | GHSA-mw96-cpmx-2vgc | Arbitrary File Write via Path Traversal | Dev only — bundler |
| `vite` (7.0.0–7.3.1) | GHSA-4w7w-66w2-5vf9 | Path traversal in optimized deps `.map` handling | Dev only |
| `vite` | GHSA-v2wj-q39q-566r | `server.fs.deny` bypassed with queries | Dev only |
| `vite` | GHSA-p9ff-h696-f583 | Arbitrary file read via dev server WebSocket | Dev only |

**Assessment**: All High/Moderate vulnerabilities are in `rollup` and `vite`, which are **dev-only build tools** (not included in the production bundle). They do not affect the running production application. However, they should be addressed to protect the local dev environment and CI.

**Status**: Fixed. `npm audit fix` was run after targeted upgrades, and the audit is now clean.

---

### [High] F-16: `rollup` Arbitrary File Write — dev only

**Status**: Fixed

**Resolved in**: `package.json`, `package-lock.json`

**Location**: `node_modules/rollup` (dev dependency, Vite bundler)
**Issue**: Path traversal allows writing arbitrary files during bundling. Would only be exploitable if processing untrusted input during a build.
**Fix**: The dependency tree now resolves `rollup@4.60.1`, which is outside the vulnerable range.

---

### [High] F-17: `vite` — multiple dev server CVEs

**Status**: Fixed

**Resolved in**: `package.json`, `package-lock.json`

**Location**: `node_modules/vite` (dev dependency)
**Issue**: Three CVEs targeting Vite's dev server: path traversal, `server.fs.deny` bypass, and arbitrary file read via WebSocket. Only exploitable if an attacker has network access to the running dev server.
**Fix**: Upgrading `vitest` and running `npm audit fix` moved the tree to `vite@8.0.8`, outside the vulnerable range.

---

## 2. Outdated Packages

| Package | Current | Latest | Action |
|---------|---------|--------|--------|
| `stripe` | 22.0.1 | 22.0.1 | Fixed |
| `convex` | 1.33.1 | 1.35.1 | Info: minor version behind |
| `@sentry/nextjs` | 10.48.0 | 10.48.0 | Fixed |
| `next` | 16.2.3 | 16.2.3 | Fixed |
| `react` / `react-dom` | 19.2.3 | 19.2.5 | Info: patch behind |
| `@base-ui/react` | 1.3.0 | 1.4.0 | Info: minor behind |
| `lucide-react` | 0.564.0 | 1.8.0 | Info: major version jump |

### [Low] F-19: `stripe` package — major version behind

**Status**: Fixed

**Resolved in**: `package.json`, `package-lock.json`

**Location**: `package.json`
**Issue**: The audit originally found `stripe@21.0.1` while `22.0.1` was available.
**Fix**: The project now uses `stripe@22.0.1`.

---

## 3. Package Integrity

No `github:`, `git+`, `file:`, or `patch:` dependencies found in `package.json`. All packages install from the npm registry with standard integrity checks.

---

## 4. Environment Variable Completeness

Key env vars referenced in the codebase:

| Var | Server-only? | Required in prod? | Documented? |
|-----|-------------|-------------------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | No (client) | Yes | Yes (`.env.example`) |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | No (client) | Yes | Yes |
| `AUTH_RESEND_KEY` | Yes | Yes | Yes |
| `AUTH_EMAIL_FROM` | Yes | No (falls back) | Yes |
| `STRIPE_SECRET_KEY` | Yes | Yes | Yes |
| `STRIPE_PRO_PRICE_ID` | Yes | Yes | Yes |
| `STRIPE_WEBHOOK_SECRET` | Yes | Yes | Yes |
| `PREVIEW_SECRET` | Yes | CMS only | Yes |
| `SITE_URL` | Yes | Yes | Yes |
| `IP_HASH_SALT` | Yes | Yes | Yes |
| `UPSTASH_REDIS_REST_URL` | Yes | Recommended | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Recommended | Yes |
| `LOCALHOST_DEV_LOGIN_SECRET` | Yes | No (dev only) | Yes |
| `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET` | **No — exposed!** | No | **See F-01** |
| `STRAVA_CLIENT_ID` | Yes | Strava feature | Yes |
| `STRAVA_CLIENT_SECRET` | Yes | Strava feature | Yes |
| `ENGINE_V2_DYNAMIC_VALIDATION_ENABLED` | Yes | No (feature flag) | Yes |
| `PDF_RICH_RENDER_ENABLED` | Yes | No (feature flag) | Yes |

**Originally missing from `.env.example`**:
- `IP_HASH_SALT` — required for non-predictable IP hashing in production (if missing, rate limiting uses `"unknown"` as key for all requests with no IP)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — without these, rate limiting on public-fit routes degrades to in-memory (per-instance, not shared across Vercel instances)

**Status**: Fixed. `.env.example` now documents `IP_HASH_SALT`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `ENGINE_V2_DYNAMIC_VALIDATION_ENABLED`, and `PDF_RICH_RENDER_ENABLED`.

---

## 5. Security-Relevant Configuration

### `poweredByHeader`

Not set in `next.config.ts`. Next.js removes `X-Powered-By` by default in production. OK.

### `convex/auth.config.ts` — magic code expiry

Magic codes expire in 15 minutes (`maxAge: 60 * 15`). Rate limit: 3 attempts per 15 minutes per email. Reasonable.

### `convex/authRateLimit.ts` — rate limit thresholds

Token-bucket: 3 requests per 15-minute window per email. Refill rate is linear. Appropriate for a magic-code flow.

---

## 6. `.gitignore` and Secret File Hygiene

No `.env`, `.env.local`, `.env.production`, or secrets files have ever been committed to the repository. The only env-related commit (`affe824`) added `.env.example` (not `.env.local`) and deployment documentation — clean.

---

## 7. Stripe Webhook Security

**Location**: `convex/http.ts:141-247`

**Good**: The webhook handler reads the raw body via `await request.text()` before signature verification. It parses the `stripe-signature` header and constructs the signed payload as `${timestamp}.${payload}` — exactly as Stripe specifies. Timestamp tolerance is 300 seconds (5 minutes).

### [Medium] F-18: Non-constant-time HMAC comparison

**Status**: Fixed

**Resolved in**: `convex/http.ts`

**Original location**: `convex/http.ts:195`

```ts
const isValid = signatures.some((s) => s === hmacHex);
```

This originally used JavaScript's strict equality `===` for comparing HMAC-SHA256 hex strings.

**Assessment**: Practical exploitability of timing attacks on HMAC-SHA256 over a network is extremely low. The attacker would need sub-millisecond timing precision across a wide-area network. This is theoretical for most deployments.

**Fix**: The handler now uses a constant-time `timingSafeEqual` helper before accepting a signature match.
