# R13A estimate contract

`shared/riderEstimates` exports estimateFtp(input, now) and estimateFlexibility(input, now).
Input uses B's sex/birthDate plus optional weightKg and existing target values.
Only status `estimated` may be shown or offered for confirmation. That branch must have
kind derived, quality 0.3, cited sources, basedOn fields and a bilingual dictionary label key.
An existing target is always preserved, regardless of its observation kind. Pure functions never write.

Research finding: both requested demographic estimates currently return unavailable, with
unsupported_reference and `[PLACEHOLDER — bron?]` for otherwise valid complete inputs.
Do NOT render that developer placeholder, fill a default, create an observation or award score credit.
Coggan's W/kg tables classify known power, not predict it from demographics; the author explicitly
does not supply age adjustments. CDC joint ROM tables have no validated conversion to the app's
five toe-reach categories. No invented average category, fitness percentile or age coefficient.

Consequently please do not promise that sex/date of birth currently produces an FTP/flexibility
estimate in rider-facing field reasons. Keep those optional fields honest about supported uses.
Sources and limitations will be recorded in audit/R13A-notes.md. No UI mount by A.
