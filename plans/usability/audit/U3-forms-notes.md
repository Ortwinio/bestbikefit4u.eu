# U3 forms implementation

Bike frame size, cassette, optional equipment/wheelset dimensions and profile numeric editing now use sliders. Unknown values remain unknown until an explicit action. Named manufacturer frame sizes remain visible and unchanged until the rider deliberately supplies a numeric frame measurement. The cassette remains an explicit list of real sprocket sizes; no inferred cassette is saved.

Profile editors preselect an existing estimated method or the logical measured/declared/self-assessed method. Welcome preserves carried method selection and lets the rider correct it while editing. Account saddle measurement defaults to measured, with an explicit estimate route that writes an estimated profile observation instead of adding a repeated measurement. Settings retain null values rather than inventing a saddle height.

The new-profile wizard previously generated height-derived inseam, weight and optional dimensions on entering a step, then recorded them as measured through upsert. Those silent writes are removed. Existing values are preserved; unknowns stay blank. Method choices are preselected, and a narrowly optional `measurementKinds` upsert argument records selected methods atomically. Existing callers remain compatible. Unchanged methods retain their original observations/repeat evidence; a deliberate same-value method correction supersedes the old provenance. Profile editing waits for provenance hydration.

The actual capped score displays its final 20% as a separate muted arc, with the shared paid boundary shown only through existing enforced-access decisions. No flag-off restriction was added.

Validation: 342 tests across bike/profile/welcome/account suites; 93 tests across measurements/validation/backend provenance suites. Application typecheck, scoped ESLint and tooltip guard passed. Board scripts executed for Profile, ProfileImprove, BikeForm, BikeProfile, RP3Welcome and RP6SaddleAccount. Parent owns combined production fixture renders and the final green U3 guard; this note does not claim a browser scope pass.

No commits, deployments, environment changes, production calls or mails.
