# Checkout source-ready-v2

POST-RERENDER UPDATE: final build0Dw9Uq506jBKvW5c7Uwwh verifies V01/V03. V02 has a pinned-action CSS width regression; see B-checkout-final-visual-review.md. Source-ready is not a visual pass.

V01, V02, V03 fixed; source stable for the one shared rebuild. No rebuild/capture by checkout worker.

- V01: immediate end-aligned notice scroll; mobile notice scroll margin reserves 112px + safe-area inset; shell bottom padding also honors safe area. Prevents post-click notice positioning beneath fixed Pay.
- V02: success action pinned on mobile; success panel precedes summary. Configured personal agenda action uses the same pinned style; placeholder stays honest, secondary action-plan link is not also pinned.
- V03: no duplicate authoritative appointment heading or personal-preview lead.

Changed source: src/components/checkout/{CheckoutFlow.tsx,AppointmentBlock.tsx,CheckoutFlow.module.css,CheckoutReview.test.tsx}. 32 checkout tests pass; focused ESLint, full TypeScript and token audit pass. Audit/P2-checkout-visual-review.md marks all findings resolved in source pending rerender; old 72-case/108-image hash manifest retained as pre-fix evidence.

Shared rerender priority: stub 390 NL/EN OFF/ON full + viewport; success/personal-preview/appointment desktop/mobile NL/EN OFF/ON. No visual pass claimed before refreshed images. No backend/payment/mail/commit/deploy activity.
