# Prompt 05 — Dependency and Configuration Audit

## Context

Read `plans/security-audit/README.md` first.

## 1. npm audit

Run:
```bash
npm audit --json 2>/dev/null | npx node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
const v=d.vulnerabilities||{};
const counts={critical:0,high:0,moderate:0,low:0};
for(const [k,pkg] of Object.entries(v)){
  const sev=(pkg.severity||'').toLowerCase();
  if(counts[sev]!==undefined) counts[sev]++;
  if(sev==='critical'||sev==='high') console.log(sev.toUpperCase(),k,pkg.via?.map?.(v=>v.title||v)||'');
}
console.log('Counts:',JSON.stringify(counts));
"
```

Or more simply:
```bash
npm audit 2>&1 | tail -20
```

Record full output. Note any Critical or High severity CVEs with their package name, version, and fix version.

## 2. Outdated packages

Run:
```bash
npm outdated 2>&1 | head -40
```

Flag any packages that are major versions behind, especially:
- `next` — check if running latest 14/15/16
- `convex` — check if on latest
- `@convex-dev/auth`
- `stripe`
- `@sentry/nextjs`

## 3. Package integrity

Check `package.json` for:
- Any packages with direct GitHub URL dependencies (e.g. `"foo": "github:user/repo"`) — these bypass npm integrity checks
- Any `patch:` or `file:` protocol entries that indicate local patches — ensure patches are still needed

Run:
```bash
grep -E '"github:|"git\+|"file:|"patch:' package.json
```

## 4. Environment variable completeness

List all environment variables referenced in the codebase and verify they are documented:

```bash
grep -rh "process\.env\.[A-Z_]" src/ convex/ scripts/ next.config.ts --include="*.ts" --include="*.tsx" | grep -oP 'process\.env\.[A-Z_]+' | sort -u
```

Cross-reference against `.env.local` (which exists in the repo for dev). Identify any env vars that:
- Are required in production but not documented
- Have no fallback and could cause a silent failure if missing
- Are server-side secrets accidentally prefixed with `NEXT_PUBLIC_`

## 5. Security-relevant configuration

Check `next.config.ts`:
- `poweredByHeader` — Is the `X-Powered-By: Next.js` header disabled? (Not critical but reduces fingerprinting)
- Any `experimental` flags enabled that could affect security

Check `convex/auth.config.ts`:
- Magic code auth — what is the expiry for magic codes?
- Is there a lockout mechanism after N failed attempts?

Check `convex/authRateLimit.ts`:
- What are the rate limit windows and thresholds?
- Are they appropriate for the use case?

## 6. `.gitignore` and secret file hygiene

Run:
```bash
git log --oneline --all --diff-filter=A -- "*.env*" "**/.env*" "**/secrets*" 2>/dev/null | head -10
```

Check that no `.env` files have ever been committed. Also check:
```bash
git log --oneline -20 --follow -- .env.local 2>/dev/null
```

## 7. Stripe webhook security

Find the Stripe webhook handler (likely in `src/app/api/stripe/` or `convex/stripe/`). Verify:
- The raw request body is used for signature verification (NOT the parsed body)
- `stripe.webhooks.constructEvent()` is called with the `STRIPE_WEBHOOK_SECRET`
- There is no fallback that accepts unsigned webhooks in production

## Output

Write findings to `plans/security-audit/findings/05-dependencies.md` using the severity format from prompt 01.

Include:
- Full `npm audit` summary
- List of critically outdated packages
- All env var issues found
- Stripe webhook verification status
