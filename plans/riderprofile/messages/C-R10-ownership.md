# R10 ownership — Codex C

C is executing lead-assigned R10 after DONE R4. No commits, deployments or production writes.

- Backend subagent: convex/bikes profile support, queries/mutations/deletion and focused tests; narrow optional schema/API additions.
- UI subagent: new BikeProfilePanel, model, tests and owner bikeProfile dictionary.
- Forms subagent: BikeForm, garage cards, localized bikeProfileForm copy and tests.
- C parent: detail-page mounting/navigation, tooltip registry, captures, combined gates and audit artifacts.

Existing A/B score/provenance/advice components are reused. Rider values remain rider-owned; bike observations are scoped to the owning bike. Changes to legacy nested setup inputs must preserve untouched metadata and retire stale measurement evidence for changed values.
The geometry library must fill actual validated database values, not merely set a source badge.
Unknown adjustment room is explicitly unknown. No comparison of saddle height (BB reference) with exposed seatpost length (collar reference).
