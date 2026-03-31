# T04 — Ad conversion setup

**Ticket:** T04
**Effort:** 1 developer-day
**Depends on:** T03 (GTM pipeline verified)

---

## Context

Without conversion signals, ad platforms optimise for clicks. With them, they optimise for sign-ups and upgrades. This is the difference between wasted spend and scalable paid acquisition. The infrastructure (GTM, consent, Convex event logging) is already in place after T03. This ticket configures the ad platform side and wires the two new conversion events.

**Scope for this sprint:** Sign-up conversion only.
**Deferred:** Pro upgrade conversion — requires billing integration (Stripe or equivalent), which is not yet implemented. Attempting to track upgrade conversions without a reliable payment confirmation signal will produce inaccurate data.

---

## New events to implement

### `sign_up_complete`

**Trigger:** `login_verified` event fires (user successfully authenticates for the first time)
**Distinction from returning login:** Check whether this is a new account. If `user.createdAt` is within the last 30 seconds, treat as sign-up. Otherwise it is a login.

**Implementation in `MarketingEventTracker.tsx`:**

The `login_verified` event already exists. Add a `isNewUser` boolean parameter to distinguish sign-up from login:

```ts
// In the login verification handler (wherever login_verified is dispatched)
const isNewUser = /* check if account was just created */;
logMarketingEvent({
  eventType: "login_verified",
  // existing params...
  metadata: { isNewUser },
});
```

Then in GTM, create a conversion trigger that fires only when `login_verified` fires with `isNewUser: true`.

### `pro_upgrade` (deferred — do not implement this sprint)

Requires Stripe webhook → Convex action → client-side signal. Defer to billing sprint.

---

## Google Ads setup

### Step 1 — Create conversion action in Google Ads

In Google Ads → Tools → Conversions → New conversion action:

| Field | Value |
|-------|-------|
| Category | Sign-up |
| Conversion name | `BikeFit_SignUp` |
| Value | Not specified (or €0 — free sign-up) |
| Count | One (count once per user, not per session) |
| Click-through window | 30 days |
| View-through window | 1 day |
| Attribution model | Data-driven (or Last click if insufficient data) |

Google Ads will provide a Conversion ID and Conversion Label. Note these.

### Step 2 — Configure Google Ads tag in GTM

1. In GTM, create a new tag: **Google Ads Conversion Tracking**
2. Conversion ID: `[from step 1]`
3. Conversion Label: `[from step 1]`
4. Conversion Value: leave blank
5. Transaction ID: use a unique identifier to prevent duplicate conversions — use `userId` from the Convex event if available, otherwise generate a client-side UUID stored in sessionStorage

**Trigger:** Custom event — fires when `login_verified` event fires **and** `isNewUser` is `true`

Create a custom trigger:
- Trigger type: Custom Event
- Event name: `login_verified`
- Add condition: `isNewUser` equals `true`

### Step 3 — Test conversion in Google Ads

Use Google Ads Tag Assistant or the "Test Conversions" tool in Google Ads → Conversions:
1. Enable test mode in GTM preview
2. Walk through sign-up flow on staging
3. Confirm "Test conversion recorded" appears in Google Ads

---

## Meta (Facebook/Instagram) Pixel setup

### Step 1 — Create Meta Pixel

In Meta Business Manager → Events Manager → Connect Data Sources → Web → Meta Pixel.

Note the Pixel ID.

### Step 2 — Add Meta Pixel base code to GTM

1. In GTM, create a new tag: **Custom HTML**
2. Paste the Meta Pixel base code with the Pixel ID
3. Trigger: **All Pages** (fires after consent is given — this is handled by the consent-based GTM loader)

### Step 3 — Add `CompleteRegistration` event

Create a second GTM tag:
- Tag type: Custom HTML
- Content:
```html
<script>
  fbq('track', 'CompleteRegistration');
</script>
```
- Trigger: Custom event — `login_verified` where `isNewUser` is `true`

### Step 4 — Test in Meta Events Manager

Use Meta's Test Events tool (Events Manager → Test Events). Walk through a sign-up on staging. Confirm `CompleteRegistration` appears.

---

## Consent enforcement

Both the Google Ads tag and the Meta Pixel base tag must only fire after cookie consent is accepted. This is already handled by `GTMConsentLoader` — it does not load GTM until consent is `"accepted"`. No additional changes needed in the tags themselves.

Verify by:
1. Opening staging in incognito
2. Declining cookies
3. Confirming neither Google Ads nor Meta Pixel fires (check Network tab for `googleadservices.com` and `facebook.com/tr/`)

---

## Deduplication

Both Google Ads and Meta risk double-counting if a user refreshes the confirmation page. Prevent this with a transaction ID:

```ts
// Generate once per sign-up, store in sessionStorage
const signUpId = sessionStorage.getItem('signUpId') ?? crypto.randomUUID();
sessionStorage.setItem('signUpId', signUpId);
// Pass as transaction_id to Google Ads tag
// Pass as event_id to Meta Pixel
```

GTM can read from the data layer — push `signUpId` with the `login_verified` event.

---

## Acceptance criteria

- [ ] Google Ads conversion action `BikeFit_SignUp` exists and is active
- [ ] Meta Pixel fires `PageView` on all pages (after consent)
- [ ] `CompleteRegistration` fires on sign-up in staging — confirmed in Meta Events Manager Test Events
- [ ] Google Ads test conversion fires on sign-up in staging — confirmed in Tag Assistant
- [ ] Neither pixel fires in an incognito session where consent is declined
- [ ] Deduplication transaction ID prevents double-counting on page refresh
- [ ] GTM container published with new tags

## Edge cases

- If a user signs up, logs out, and logs back in, `isNewUser` must be `false` on subsequent logins — do not re-fire the conversion
- If billing is added later, `pro_upgrade` conversion value should be `9.00` EUR — pre-create the conversion action in Google Ads and Meta now (with €0 value, not live) so it is ready to activate without delay

## Human audit checklist

- [ ] Walk through sign-up on staging — confirm Google Ads test conversion in Tag Assistant
- [ ] Walk through sign-up on staging — confirm `CompleteRegistration` in Meta Events Manager Test Events
- [ ] Decline consent in incognito — confirm no pixel fires
- [ ] Sign up twice as same user — confirm conversion fires only once (deduplication)
