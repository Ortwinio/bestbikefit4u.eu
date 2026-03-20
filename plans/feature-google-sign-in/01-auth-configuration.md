# Step 01: Auth Configuration

## Objective

Add Google OAuth to the existing Convex Auth setup in a way that preserves the Resend magic-code flow and does not fork authentication logic across multiple systems.

## Files In Scope

- [`convex/auth.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/auth.ts)
- [`convex/auth.config.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/auth.config.ts)
- [`.env.example`](/Users/ortwinverreck/Developer/bestbikefit4u/.env.example)
- deployment notes under [`docs/VERCEL_DEPLOYMENT.md`](/Users/ortwinverreck/Developer/bestbikefit4u/docs/VERCEL_DEPLOYMENT.md) if implementation reaches docs

## Plan

1. Add a Google OAuth provider config to `convex/auth.ts`.
2. Keep the current `EmailProvider` registered.
3. Use provider IDs that make the frontend call explicit and stable, e.g. `signIn("google")`.
4. Configure redirect behavior so OAuth returns safely to the app dashboard or intended post-login path.
5. Add required environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - confirm `SITE_URL` remains the production callback base
6. Keep provider order intentional: email remains supported; Google is additive.

## Design Notes

- This repo already has `@auth/core` installed, so the implementation should use an Auth.js-style Google provider config through Convex Auth rather than introducing a second auth library.
- The Google provider should request `openid profile email` and use Google’s returned `name`, `email`, and `picture`.
- OAuth callback URLs must match Convex Auth’s production site URL setup, not just Vercel frontend URLs in isolation.

## Acceptance Check

- `convex/auth.ts` exports a single Convex Auth config containing both email and Google providers.
- Local and production env requirements are documented.
- No existing magic-code flow behavior is removed.
