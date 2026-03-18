# Step 02 — Route Coverage Check

## Objective

List every app route and confirm it has been localized (or is intentionally locale-neutral).

## Tasks

1. **List all routes** from `src/app/` directory structure:
   - Public routes (under `(public)/`)
   - Dashboard routes (under `(dashboard)/` or equivalent)
   - Auth routes
   - API routes (locale-neutral — skip)

2. **For each route, verify:**
   - Is it under a `[locale]` segment or equivalent locale-aware path?
   - Does the page component use the translation dictionary (not hardcoded strings)?
   - Does page metadata (title, description) use translated values?

3. **Locale switch behavior:**
   - On a public page: does switching EN↔NL navigate to the equivalent locale path?
   - On a dashboard page: does switching preserve the current route (not redirect to dashboard home)?
   - On auth pages (sign-in, verify): are these localized or intentionally English-only?

4. **Edge routes:**
   - 404 page — does it show localized content?
   - Error boundary — does it show localized copy?
   - Loading.tsx files — do they use translated copy or are they spinner-only?

## Output

Document in `output-02-route-coverage-check.md`:
- Route coverage table: route | locale-aware? | metadata translated? | switch works?
- Gaps identified with priority
