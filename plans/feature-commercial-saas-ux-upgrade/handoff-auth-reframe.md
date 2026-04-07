# Handoff: Auth Page Implementation

Exact diff intent for task "Auth page implementation." Can run in parallel with pricing once the homepage structure task is complete.

## Reference

- UX contract: `plans/feature-commercial-saas-ux-upgrade/ux-contract.md`
- Plan prompt: `plans/feature-commercial-saas-ux-upgrade/03-auth-start-page-reframe.md`

## Current State

`src/app/(auth)/login/page.tsx` is a client component with:
- Sign-in-only framing ("Sign in to BestBikeFit4U")
- USP panel above the form (3 bullets about why bike fit matters)
- Google auth + magic-code email flow
- Source tag tracking via `?src=` param
- Marketing events: `funnel_login_view`, `login_code_requested`, `login_verified`, etc.

Layout is `src/app/(auth)/layout.tsx` — centered single-column with brand logo.

## Changes Required

### 1. Reframe page title and copy

In `loginCopy.en`:
```
signInTitle: "Sign in to BestBikeFit4U" -> "Create your account or sign in"
noPasswordHint: "No password needed..." -> "No password needed. We send you a secure code — works for new and existing accounts."
```

In `loginCopy.nl`:
```
signInTitle: "Log in bij BestBikeFit4U" -> "Maak je account aan of log in"
noPasswordHint: "Geen wachtwoord nodig..." -> "Geen wachtwoord nodig. We sturen een veilige code — werkt voor nieuwe en bestaande accounts."
```

### 2. Rewrite USP panel as proof-of-value panel

Replace the current `uspPanel` content. Both EN and NL:

**EN:**
```
uspTitle: "Why a proper bike fit matters" -> "What you get after signing up"
uspSubtitle: "BestBikeFit4U helps you ride better..." -> "Your free account includes:"
uspItems: [
  "Personalized saddle height, reach, and handlebar targets",
  "Prioritized adjustment sequence — what to change first",
  "Email report with your complete fit analysis",
]
```

**NL:**
```
uspTitle: "Waarom een goede bikefitting belangrijk is" -> "Wat je krijgt na het aanmelden"
uspSubtitle: "Met BestBikeFit4U rijd je..." -> "Je gratis account bevat:"
uspItems: [
  "Persoonlijke afstelwaarden voor zadel, reach en stuur",
  "Prioriteitsvolgorde — wat je als eerste aanpast",
  "E-mailrapport met je complete fitanalyse",
]
```

### 3. Add support reassurance below the form

After the `legalHint` paragraph, add a support reassurance block:

```tsx
<p className="mt-3 text-center text-xs text-muted-foreground">
  {locale === "nl"
    ? "Hulp nodig? Stuur een mail naar support — we reageren binnen 24 uur."
    : "Need help? Email support — we respond within 24 hours."}
</p>
```

### 4. Preserve all auth mechanics

Do NOT change:
- `signIn("resend", ...)` flow
- `signIn("google", ...)` flow
- `signIn("localhost-dev", ...)` flow
- `sourceTag` extraction
- Any `logMarketingEvent` calls
- `oauthRedirectingRef` beforeunload suppression

### Validation checklist

- [ ] First-time users understand they can create an account here
- [ ] Returning users can still sign in quickly (unchanged flow)
- [ ] Passwordless explained clearly for both audiences
- [ ] USP panel shows what you GET, not why fitting matters
- [ ] Support reassurance visible
- [ ] Auth behavior unchanged (test magic code + Google flows)
- [ ] sourceTag and analytics events preserved
- [ ] Light/dark/system theme readability checked
- [ ] EN/NL copy has semantic parity
