# Manual actions for the owner, in order

Canonical: **https://bikefitboost.com** (no www). Values are exact; copy them as written.
Steps marked **[lead]** are done by Claude; the rest you do in the relevant dashboard.

## A. Preparation (can start now, changes nothing for visitors)

1. **Resend: add the sending domain**
   - Resend → Domains → Add domain: `notifications.bikefitboost.com`, region EU (same as the current domain).
   - Add the DNS records Resend shows at the registrar of bikefitboost.com. The current domain uses this pattern; expect the same for the new one:
     - TXT `resend._domainkey.notifications` → (DKIM value from Resend)
     - MX `send.notifications` → `feedback-smtp.eu-west-1.amazonses.com` priority `10`
     - TXT `send.notifications` → `v=spf1 include:amazonses.com ~all`
   - Wait until Resend shows **Verified**. Keep the old domain `notifications.bestbikefit4u.eu` active for now.
2. **Google Workspace (bikefitboost.com): create addresses**
   - Mailbox or alias `support@bikefitboost.com` and `security@bikefitboost.com`.
   - DMARC already exists (`v=DMARC1;p=none;`). Advice: after 2–4 weeks of clean reports, move to `p=quarantine` and add a reporting address (`rua=mailto:dmarc@bikefitboost.com`).
3. **Google Search Console**
   - Add a **Domain property** `bikefitboost.com`. A `google-site-verification` TXT record is already on the domain; if Search Console asks for a different one, add it.
4. **Google Cloud Console: OAuth client** `491678180647-3qk88d0np4muq09ibjk2biol8nciiibg` (APIs & Services → Credentials)
   - Authorized JavaScript origins, **add**: `https://bikefitboost.com`
   - Authorized redirect URIs, **add**: `https://bikefitboost.com/api/auth/callback/google`
     (keep the existing `https://elegant-panther-767.eu-west-1.convex.site/api/auth/callback/google` until the new one works, for rollback)
   - OAuth consent screen / Branding:
     - Authorized domains, add `bikefitboost.com`
     - Application home page `https://bikefitboost.com/en`
     - Privacy policy `https://bikefitboost.com/en/privacy`
     - Terms of service `https://bikefitboost.com/en/terms`
   - Google may need a few minutes up to hours to apply changes; a branding change can trigger a review.
5. **Strava**: the integration is removed from the site (M4). Nothing to do before go-live.

## B. Go-live (in one go, in this order)

1. **[lead]** Merge the PR and deploy Convex. The code then uses `https://bikefitboost.com` and 301 redirects for all old hosts.
2. **Vercel → Project → Settings → Domains**
   - `bikefitboost.com` → **Production** (no redirect). This is the primary domain.
   - `www.bikefitboost.com` → Redirect to `bikefitboost.com`, **301**.
   - `bestbikefit4u.eu` → Redirect to `bikefitboost.com`, **301**.
   - `www.bestbikefit4u.eu` → Redirect to `bikefitboost.com`, **301** (not to `bestbikefit4u.eu`: that is the current double hop).
   - Keep all four domains attached to the project (valid SSL).
   - Vercel → Settings → Environment Variables (Production, Preview, Development): `NEXT_PUBLIC_SITE_URL=https://bikefitboost.com` and `SITE_URL=https://bikefitboost.com` (if present), then **Redeploy**.
3. **[lead]** Convex production env:
   - `SITE_URL=https://bikefitboost.com`
   - `CUSTOM_AUTH_SITE_URL=https://bikefitboost.com` (only after A4 is done)
   - `AUTH_EMAIL_FROM=BikeFitBoost <noreply@notifications.bikefitboost.com>` (only after A1 is verified)
   - Remove the misnamed variable `NET_PUBLIC_CONVEX_URL` (unused; it points at another deployment).
   Also remove `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` from Convex prod (after the deploy).
4. **[lead]** Database: backup (`convex export --prod`), dry-run, then rewrite the 48 guide image URLs.
5. **[lead]** Run the check script against production: 25+ old URLs → one 301, sitemap/robots/canonicals, login with magic code and Google, one test email to yourself.

## C. After go-live

0. **Strava:** on strava.com/settings/api, delete the API application (client ID `215085`). Then, after your separate go, **[lead]** runs the dry-run-first cleanup of stored Strava tokens (`plans/migratie/audit/M4-cleanup-runbook.md`).

1. **Search Console**
   - In the old property `bestbikefit4u.eu` → Settings → **Change of address** → choose `bikefitboost.com`.
   - In the new property, submit the sitemap `https://bikefitboost.com/sitemap.xml`.
2. **Keep the old domain** `bestbikefit4u.eu` registered for at least **12 months**, with the Vercel redirects and valid SSL. Keep the old Resend domain for 2–4 weeks for emails that are still in transit.
3. **External links and profiles:** update the website URL on social profiles, Google Business, newsletter/footer links and directories where you are listed.
4. **Stripe** (when billing is activated later): webhook endpoint and return URLs on the new domain. No action now; Stripe is still stubbed.
