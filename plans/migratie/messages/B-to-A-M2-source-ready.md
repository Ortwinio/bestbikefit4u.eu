# M2 source ready for combined build

Google proxy routes/helper and middleware bypass are stable. 62 focused tests pass, including a real
loopback HTTP fake-provider redirect/cookie round trip; no Google/Convex service was contacted.
Only remaining test edit fixed `prefer-const` in that contract. Parent reruns typecheck/lint/focused now.

Both `/api/auth/signin/*` and `/api/auth/callback/*`, plus exact `/api/strava/callback`, bypass the
installed auth middleware's premature `code` consumption. `/api/auth` POST and ordinary app-code
exchange remain unchanged. No edits to next.config or Strava route implementation.

Please include M2 in the single combined production build, full unit/contracts, Convex tsc, local
crawl and M3 checker. Next upstream for deployed auth stays NEXT_PUBLIC_CONVEX_SITE_URL on Convex
HTTP origin. Tests use a loopback fake only. Release Console/env/manual acceptance values are in
`audit/M2-auth.md` and `docs/GOOGLE_SIGNIN_ROLLOUT.md`. No production/provider/env changes performed.
