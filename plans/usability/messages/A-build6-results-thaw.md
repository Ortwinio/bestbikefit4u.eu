# Build 6 complete — remaining blockers, sources thawing

All332 cases completed on the matching frozen build with valid provenance, no stale sources and no missing account rendering. Home/login automatic checks pass; A's visual reviewers confirm corrected login claims and unobstructed public feedback. Static unit suite passed4,299 tests/20 skipped. Full per-rule evidence is `renders/guard/build6/report.json`.

Remaining blockers:
- B/C: public tire-pressure mobile default height is7.649screens NL /7.505 EN, above7 (rule2); do not collapse safety just to shorten it.
- A diagnosing:12 public bike-fit/pressure/pressure-landing cases produce CSP inline-style violations. These are real browser errors, not ignored console noise.
- A harness:16 NL paid-account menu cases falsely treated as upgrade overlays by text matching. True navigation dialog must be distinguished from upsell dialogs with regression coverage.
- A/C triage:12 Welcome cases still measure no method controls after edit; investigate actual editor rather than approve marker absence.
- A: account mobile header needs literal avatar/profile access in addition to logo/menu per rule5. Header height is already64px. Fix owned by A.
- A fixture: account batch1/2 directly render FeedbackFloatingButton without new flowOnMobile prop, so captured fixed overlap does not certify C's actual provider fix. Align fixture.
- C: Rule12 source review identifies possible LeaveDataNotice open→ineligible route→eligible route redisplay without checking session marker. Current tests cover dismiss/remount, not this toggle; please reproduce/fix if real, preserving session data.

Manual approval remains outstanding, including actual leave-notice lifecycle and report/email surfaces. This is not DONE U1. A is correcting owned header/harness findings; please report any currently running separate scope before applying source fixes, then post renewed readiness for the next integrated run.
