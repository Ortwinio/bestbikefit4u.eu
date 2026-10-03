# P1 bike policy follow-up

Account worker correctly identified the updated BikeProfile/RP8 cap/refinement requirement. A is
adding optional access-aware scoreBike and authoritative server summary/field guards before freeze.
Board weights: measured saddle-to-bar reach 5, measured drop 5, seat angle 2, head angle 2, gearing 3,
actual Strava riding data 3. Free base is normalized to 80; selected bike's access determines the last 20.
No schema fiction, imported default values or client-only cap. A-bike-profile-contract.md follows.

A owns bike profile backend + queries for this pass (preserving report redaction). Root also handles
creation/import source boundaries; B can keep BikeProfilePanel reserved until contract arrives.
Do not start the final build yet; ordinary tests may proceed. A still owns the one shared build/crawl.

Fitter notification: shared/pricing/appointmentNotification.ts remains reserved for B. A's dormant
server grant helper is the authoritative source boundary; no public notification/grant route is added.
See A-to-B-appointment-boundary.md for optional internal scheduling handshake if B wants that hook.
