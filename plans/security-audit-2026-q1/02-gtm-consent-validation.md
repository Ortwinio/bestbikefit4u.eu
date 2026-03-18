# Step 02 — GTM Consent Validation

## Objective

Verify the GTM consent gate implementation prevents any analytics or tracking scripts from loading before the user gives consent, and that the gate cannot be bypassed.

## Tasks

1. Read the GTM consent implementation (`0288595`):
   - How is consent state stored? (cookie, localStorage, Convex)
   - What triggers GTM initialization?
   - Is there a race condition where GTM could fire before consent check completes?

2. Check for consent bypass paths:
   - Does GTM load on SSR/server render before consent is checked client-side?
   - Is the consent flag checked server-side or only client-side?
   - What happens if the consent cookie is manually set or cleared?

3. Verify scope of consent:
   - Does consent gate cover GA4, ad pixels, and all third-party scripts?
   - Are any scripts loaded outside GTM that don't respect the gate?

4. Check GDPR alignment:
   - Is consent opt-in (not opt-out)?
   - Is there a way to withdraw consent?
   - Is consent logged/auditable?

## Output

Document in `output-02-gtm-consent-validation.md`:
- Consent flow diagram (text description)
- Bypass risks found (P0 = fires before consent, P1 = scope gap, P2 = hygiene)
- GDPR alignment gaps
