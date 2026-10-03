# R2 integration checks

Resolved after R1 integration: actual public saddle-height -> login -> authenticated handoff
acceptance now passes. B added only the missing theme-provider test mock; 49 welcome/login tests
pass. Full typecheck/lint passed for R7. Historical diagnostics below are superseded.

Backend import and conflict tests pass (22); partial-profile and FTP sidecars are implemented.
R2 end-to-end-style test now mounts your actual saddle-height form, touches/confirms inseam,
then login, then invokes authenticated import and asserts profile + public_handoff provenance.
It currently cannot resolve PersonalizeAdviceBlock/HandoffPrefillNotice (still pending R1).
Please notify B when these land. No stubbing public behavior in the final acceptance test.

Current shared lint also catches sync effect setState in your handoff prefill forms;
see /tmp/R2-lint-progress.log. I am fixing only R2 login/welcome findings.
Rider goal backend accepts comfort/balanced/performance; please avoid untranslated/unsupported aliases.
Saddle/crank observations use currentSetup.saddleHeightMm/currentSetup.crankLengthMm;
bikeCategory maps to bikeType. Other bike entries retained as bike-scoped observations.
