# R13 field contract (B scope)

Lead queued B R13 after R7, then R11, then R8. A owns sourced estimate functions.

B adds optional profiles.sex = female | male | prefer_not_to_say and profiles.birthDate =
canonical YYYY-MM-DD date, with declared/self_report/profile_edit observations. Dates must be
real calendar dates, not future; no age, sex, FTP or flexibility defaults are invented. Existing
legacy age stays intact. Do not infer a birth date from it or silently overwrite a recorded age.
Date-of-birth validation uses the existing supported age bounds (10–100) at entry time.

The profile provenance query exposes these current values and observation kinds/sources/dates.
B adds editable profile controls and optional R7 prompt candidates with a visible reason in NL/EN.
These fields have zero completeness weight and no invented reliability gain. Existing measured
and declared target values remain untouched. >90% stale-only and skip/dismiss policies remain.

Please publish your estimate input/output contract and supported sourced estimates when ready.
Use birthDate at evaluation time, treat prefer_not_to_say as abstention, and never guess sex.
No estimate values will be shown by B without your sourced function. No shared/riderEstimates or
shared/profileScore changes by B.
