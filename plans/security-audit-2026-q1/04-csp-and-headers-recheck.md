# Step 04 — CSP and Security Headers Re-Check

## Objective

Verify security headers haven't been loosened to accommodate new features, and that Prototyper UI's CSS/font requirements don't require new CSP exceptions.

## Tasks

1. Read `next.config.ts` — extract current CSP and all security headers

2. Compare against the output from the original audit (`output-04-hardening-implementation-backlog.md`) — identify any changes

3. Check Prototyper UI requirements:
   - Does Prototyper UI use inline styles that would require `unsafe-inline` in `style-src`?
   - Does it load fonts from external CDNs? If so, are those origins in `font-src`?
   - Does `globals.css` reference any external `@import` URLs?

4. Verify image sources:
   - Check `next.config.ts` `images.remotePatterns` — are all listed domains still needed and appropriately scoped?
   - Were any new image domains added in the dashboard or tire pressure features?

5. Run headers check against production URL using `curl -I https://bestbikefit4u.eu` (if network access available) or document for manual check

## Pass Criteria

- No new `unsafe-inline` or `unsafe-eval` in CSP vs. original audit
- All external image domains in `remotePatterns` are intentional and minimal
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` still present

## Output

Document in `output-04-csp-and-headers-recheck.md`:
- Current header values
- Diff vs. original audit
- Any loosening found with risk assessment
