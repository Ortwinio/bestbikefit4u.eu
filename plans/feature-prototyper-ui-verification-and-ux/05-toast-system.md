# Step 05 — Toast Notification System

## Objective

Add a toast notification pattern for a small set of high-value async outcomes, but only after verifying an upstream Prototyper toast primitive exists and can be integrated safely.

## Background

Do not assume a toast primitive already exists in this repo.

## Use Cases to Cover

| Action | Toast type | Message |
|--------|-----------|---------|
| Bike saved (create/edit) | success | "Bike saved" |
| Bike deleted | success | "Bike deleted" |
| Fit session started | success | "Fit session started" |
| Profile updated | success | "Profile updated" |
| Email report sent | success | "Report sent to your email" |
| Mutation error (network/Convex) | error | "Something went wrong. Please try again." |
| Session regeneration complete | success | "Recommendations updated" |
| Cookie consent accepted | info | "Preferences saved" |

## Tasks

1. **Feasibility check:**
   Confirm whether a Prototyper `toast` primitive exists upstream and whether it fits the current app shell.

2. **Create the local toast layer** only if feasibility passes:
   - thin adapter over the upstream primitive
   - export `ToastProvider`, `useToast` hook (or equivalent)
   - export from `src/components/ui/index.ts`

3. **Wire `ToastProvider` at the correct shell level:**
   Prefer the root app shell if both public and dashboard routes need access.
   Do not duplicate providers across layout branches unless isolation is required.

4. **Add i18n keys** for all toast messages:
   - Add to `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts` under `common.toasts.*`
   - Run `npm run test:i18n` to verify key parity

5. **Wire toast calls** into a small, agreed set of mutation success/error paths. Prefer to call toasts from the component that initiates the mutation (not inside a Convex mutation handler). Initial target locations:
   - `src/components/bikes/BikeForm.tsx` — save/delete
   - `src/app/(dashboard)/settings/page.tsx` or current profile-update owner
   - `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` — email sent, regenerate complete
   - `src/components/layout/CookieConsentBanner.tsx` — consent accepted

   Add more locations only if they materially improve UX in this pass.

6. **Handle Convex mutation errors** with a generic error toast in each chosen location. Do not replace inline form validation — toasts are for async action outcomes only.

7. **Accessibility:**
   - Toasts must have `role="status"` (info/success) or `role="alert"` (error)
   - Auto-dismiss after 4–5s for success/info; no auto-dismiss for errors
   - Must be dismissible by keyboard (Escape or close button)

## Output

Write `output-05-toast-system.md`:
- Toast component API and `ToastProvider` wiring
- i18n keys added (EN/NL)
- Mutation locations wired
- Any proposed locations explicitly deferred
- Accessibility notes
- Quality gate results (`npm run test:i18n`, `tsc`, `build`)
