# F1 backend and evaluation mail

Implemented owned Convex reliability measurement tables, idempotent inseam and knee mutations, owned saddle-state/dashboard queries and seven-day scheduled evaluation. All measurements use server-side shared models. Existing engine recommendation centres remain unchanged. Latest three actual inseam measurements set mean/spread and profile provenance; declared defaults never become repeats. Warnings carry through aggregate evidence. Knee saves retain immutable provenance so retries cannot change advice after a later profile edit.

Paid enforcement uses existing getUserAccess fullReport (including selected bike ownership); enforcement off allows signed-in users. Every public method authenticates. Evaluation rechecks current service preferences, due date, owner/bike existence, superseding measurements and sent state. Existing email delivery/preference links and provider idempotency key are reused. No provider calls in tests.

B consumes messages/C-backend-types.md. Both save mutations require a requestId generated once per intentional measurement and reused for network retries. Evaluation link currently /tools/knee-angle; B must confirm final UI route.

Local preview command rendered all 42 bilingual HTML/text messages and 84 screenshots (600/375) to ignored plans/reliability/renders/email-previews. All layout/asset checks pass. New NL375 and EN600 images visually reviewed: no overflow, readable copy, preference links present. No images, logs or crawl output belong in file manifests.

Final focused backend/template tests: 24 passed. Convex tsc passed. Owned ESLint passed. Root-owned generated API, aggregate-warning and frozen provenance integration included. No commits, deployments, environment changes or real sends.

Account controls: saveSaddlePreferences persists actual partial preferences keyed by owner/optional bike; aero goal, climbing and no-bike setup survive visits. Flex/core update existing profile with estimated/self_assessment provenance. getSaddleState exposes controls, source date and applies climbing term. Dashboard only exposes A when paid enforcement denies full report. Shared buildReliabilityEvidence ignores observations not matching exact report/profile values.

Final integration rerun: 456 tests across 40 files passed; whole-tree typecheck, Convex tsc and full lint passed. Latest reliability contract suite has 24 cases including invalid legacy measured 50/110 cm corrected to 89 cm without seeding old values. Series anchors prevent history resurrection; retries return immutable saved summaries. User/bike deletion covers all new tables. UI route /tools/knee-angle is confirmed by B.
