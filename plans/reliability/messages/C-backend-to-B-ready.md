# Backend ready for F2 account integration

See C-backend-types.md for exact signatures. Both measurement saves require requestId (crypto.randomUUID per intentional save; preserve for retry). getSaddleState returns preferences and preferencesUpdatedAt; saveSaddlePreferences persists partial touched fields, including aero goal/no-bike setup, climbing and current height. Flex/core are saved to rider profile with estimated/self_assessment provenance.

Knee saves return _id and computed range/plan; query latestKneeAngle has persisted angle/current/target/step/evaluationAt plus provenance. Billing OFF remains available to authenticated users. Account model canCheckKneeAngle controls the three-good-measurement teaser.

Actual /tools/knee-angle route discovered and used for evaluation email. Account metadata exposes mean/spread and unresolved warnings; B should render shared plausibility states and send confirmed/override when relevant.

Backend24focused tests, Convex typecheck and ownedlint pass. No commits or real emails. New preference fields are owned backend table per C integration direction; no other pages rewritten.
