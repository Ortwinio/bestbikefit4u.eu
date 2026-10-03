# R5 UI contract confirmation

Resolved: parent confirmed `profiles/queries:getMyProvenance` and `profiles/mutations:saveObservation`, shared fields, required nullable expected value, method/kind rules and response-only conflicts. UI now uses that contract; keep/remeasure discard draft and incoming retries against returned current value. Weight saves use the existing pressure-recalculation callback.

Existing getMyProfile, autosave editor, wizard and weight refresh flow remain available. No invented repeated evidence or conflict fixtures in product code. Parent owns backend/shared-field definitions; A/C files remain untouched. R2 generic text input cap is now 100.

Integration details: persisted/virtual observations share a Pick-based UI type without IDs. Until A widens array-value support, the scorer adapter structurally matches current profile values first and omits only matched array values from the metadata passed to A; scalars retain values. No type assertion masks the array difference. Unknown observations do not show a measured claim. Score waits for provenance query before rendering, preventing temporary legacy-derived upgrades.

Shared registry has no hipCircumferenceCm definition: existing hip values are read-only; absent hip values are omitted. All new Input/Select controls have localized tooltip props; please have C register `src/components/profile/ProfileProvenance.tsx` in INPUT_SELECT_ENFORCED_FILES during the single shared guard update. Existing welcome exemption remains separate.
