Define implementation validation, rollout, and copy requirements.

Validation must cover:

- bike page still works for existing bikes with one `photoUrl`
- bike page works for bikes with no photo
- multi-photo flow works end to end
- extra wheelset flow works end to end
- active wheelset behavior still feeds pressure flows correctly
- LLM description remains editable and does not inject geometry claims
- EN/NL copy is present for all rider-facing additions

Rollout guidance:

- introduce data compatibility first
- ship bike page UX after compatibility is in place
- ship LLM generation behind an explicit feature flag if needed

Output file:

- `output-06-validation-rollout-and-copy.md`
