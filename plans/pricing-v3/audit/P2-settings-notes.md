# P2 Settings subscription UI

## Delivered and frozen

- New subscription overview always replaces legacy Free/Pro billing UI. Enforcement OFF preserves full access, not the old card. Unrelated Settings behavior is preserved; dead portal/tier handlers and imports are removed.
- Uses generated `api.pricing.queries.getSubscription` and owner-scoped bikes query. A's canonical products/access and published period price, renewed, cancelled and appointment metadata are consumed. No pending API dependency or makeFunctionReference. Unknown metadata is omitted, not fabricated.
- Token-only responsive presentation with NL/EN copy in `src/i18n/account/subscription.ts`. Canonical PRODUCTS supplies amounts. Renewal is €19.50; €5 discount appears only for known €24.50 initial period with renewed=false. Personal, entry, renewed and unknown amounts do not falsely claim that discount.
- Localized appointment link to /checkout?appointment=1 appears only for authoritative appointmentAvailable=true, not merely personal plan. Used/false/unknown hides it. Navigation performs no sender/payment action.
- Cancellation choice persists before C's authenticated501 stub. Storage failure prevents POST; network failure preserves access. Shared stub copy explicitly states no cancellation/refund occurred. First-year and renewed/pro-rata terms do not fabricate refund amounts.

## Focused validation

- 37 tests pass across `src/components/account/SubscriptionOverview.test.tsx` and `src/app/(dashboard)/settings/page.test.tsx`.
- Covers NL/EN, OFF/ON always-visible overview, canonical metadata, discount guard, appointment availability, cancellation persistence/stub/storage/network failures, and unrelated Settings behavior.
- Scoped ESLint passed; generated API integration typecheck passed. Parent coordinates full integration gates. Settings source is frozen.

## Visual proof and remaining integration work

Final v3: full200 capture passes all automated checks on build6KW82hm49ljNYI1ddtwmm. Parent-approved same-build disk production CSS fallback is recorded (requested62855 login returned500). Against preserved v2 hashes,292/300 PNGs are identical; only8 checkout mobile success PNGs changed. All108 Settings/Dashboard PNGs are identical, retaining completed v2 manual review. See `renders/p2-visual/final-v3-proof.md`; checkout reviewer owns final8-image acceptance. No new Settings/Dashboard confirmed findings.

CSS provenance independently verified in `audit/P2-css-provenance.json`: repaired offline preview49975 login200; served/disk/capture CSS SHA256899fc0bc9c857075af6679c65c5fd83b36ecc689e89213584af9910e00de66ac, unchanged build. Actual capture provenance remains disk fallback; no recapture. Fixed checkout CTA bounds pass16px gutters before/after screenshots (left16/right374/width358 at390).

- Matrix200: pricing8, checkout72, reports48, Settings56, Dashboard16; NL/EN ×1440/390 ×OFF/ON. Actual personal entitlement and explicit personal preview remain distinct.
- Initial full sweep captured all200 with production CSS from http://127.0.0.1:58410, build UYxIkN6xXxBU0VSr0nQh7. Its two older-free-report mobile PDF-button overflow failures were fixed by parent and pass the final v2 geometry checks.
- Initial Settings/Dashboard review covered72 cases,108 PNGs,84 unique hashes,21 sheets. Its AccountPlan sidebar label and Dashboard notice contrast findings are resolved and re-reviewed in v2.
- Proof and preserved hashes: `renders/p2-visual/settings-dashboard-review-initial/review.md` and `inventory.json`.
- Final v2 rerun completed:200/200, zero automated failures, build0Dw9Uq506jBKvW5c7Uwwh, production CSS origin60620. All300 PNGs compared:206 unchanged/94 changed. Settings/Dashboard74 unchanged PNGs retain initial review; all34 changed images inspected across9 sheets. Plan labels and Dashboard contrast corrected. Final proof: \`renders/p2-visual/settings-dashboard-review-final-changed/review.md\`; sidebar independent-scroll limitation and raw small-control advisories are explicitly recorded there.
- Genuine app components use synthetic auth/query/navigation boundaries and compiled production CSS. No real Convex/mail/payment, deployed authentication, Next hydration or backend end-to-end behavior verified. Light appearance only; not every scroll position exercised.

No commits, deploys, backend/shared UI/frozen dictionary edits or real payment/mail calls by this worker. Settings implementation files: `audit/files-P2-settings.txt`.
