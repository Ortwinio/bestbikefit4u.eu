# Auth Start-Page Reframe

## Objective

Reframe the `/login` page into a combined “Create account / Sign in” start experience so first-time users understand they begin here after getting value, while returning users still move quickly.

## Inputs

- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/login/page.tsx)
- [ThemeProvider.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/providers/ThemeProvider.tsx)
- Output from Step 01

## Tasks

1. Rewrite the top-level auth copy so the page is positioned as the start of your account journey, not only a login screen.
2. Clarify that the same flow serves both new and returning users.
3. Add short proof and reassurance near the form:
   what users get after continuing, no password required, support fallback, privacy clarity.
4. Improve layout hierarchy so the form, benefits, and reassurance blocks feel like a premium SaaS onboarding surface.
5. Preserve Google auth and magic-code behavior without changing the underlying auth mechanics.
6. Keep source-tag and marketing event tracking intact.
7. Ensure the page remains clear in both light and dark themes.

## Deliverable

A more commercially effective auth start page with clearer onboarding language, better reassurance, and unchanged authentication behavior.

## Completion Checklist

- [ ] First-time users can understand this page is where they start.
- [ ] Returning users can still sign in quickly.
- [ ] Passwordless behavior is explained clearly.
- [ ] Support and privacy reassurance are visible.
- [ ] Auth behavior and analytics are preserved.
