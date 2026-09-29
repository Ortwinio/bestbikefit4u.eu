# Account batch 20.2 visual fixtures

Run `node tests/visual/account-batch2/capture.mjs` with the frontend available at
`http://localhost:3000`. Override `VISUAL_DEV_ORIGIN` if needed. Optional
`--filter=questionnaire` (route/state substring) and `VISUAL_LOCALES=nl` narrow the
matrix. The isolated fixture server chooses an unused loopback port.

The harness renders real account pages, shell, UI primitives, compiled Next CSS,
fonts and local assets at 1440×1000 and 390×844 in Dutch and English. Convex,
authentication, telemetry and actions are isolated synthetic fixtures. It reuses
batch 1's image/link adapters. No production auth bypass or backend writes occur.
The questionnaire uses the backend's actual filtered `getAllQuestions()` order.

States cover Dashboard regression, fit creation with/without bike/profile/loading,
questionnaire intro/saved/loading/missing, results main/climbing/expanded details/
email/error/generation/incomplete/loading/missing, method and history states.
Climbing, expanded details and email states use real UI interactions. Dashboard
checks include Dutch enum labels, full-height sticky ink rail, both mobile menu
openers, focus containment/restoration, and desktop-resize dismissal.

Captures go to `plans/redesign-canvas/audit/20.2-renders`. JSON stdout records
runtime errors, query coverage, overflow, target sizes and source fingerprints.
Runtime errors, overflow or an incomplete ink rail fail the run. Small controls
are reported separately so inherited shared-UI exceptions can be routed to their
owner rather than hidden. Review images as well as metrics: metrics alone do not
prove typography, contrast or spacing.

These captures do not certify real authentication, email delivery, PDF contents,
payment, consent persistence or backend authorization. Route/unit tests exercise
payloads, conditional questions, errors, gating and navigation with mocked service
boundaries. This is explicitly the plan's fixture fallback, not a live-user test.
