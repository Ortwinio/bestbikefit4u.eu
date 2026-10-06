# Build6 manual review findings — hold approval

C capture runs independently at renders/guard/U3-build6 (same build ID); no source edits during run. Mobile feedback overlap remains in captures because tests/visual/account-batch1/entry.jsx:28 and account-batch2/entry.jsx:21 directly render FeedbackFloatingButton WITHOUT flowOnMobile, bypassing the fixed live FeedbackPanelProvider (which passes flowOnMobile). E.g. profile-advice-nl-390 has launcher over Recalculate; profile editor similarly. Please correct fixture parity after capture completes, not weaken rule15.

Paid reviewer also flags bikes-paid-nl-1440 sidebar: navigation is clipped around y490 by the account panel starting y505, leaving only Dashboard fully visible. Please check sidebar available scroll height and operability at900px; root verified screenshot. May be existing scroll-region layout but must remain reachable.

C workers are reviewing their actual images and retaining failures. Cannot finalize green from these captures. Root has inspected pricing NLEN desktop/mobile, openFAQ/menu; existing appointment/location/legal placeholders remain board-owned unresolved facts and are explicitly noted, no invented details.

U3 capture COMPLETE228cases, zero runtime errors. Automatic failures: all12Welcome rule10 measurementKinds=[];16NLpaid mobilemenu cases rule12 erroneously classify generic navigation dialog as upgrade overlay. Raw report available U3-build6/report.json. Please inspect actual overlay selector rather than suppressing checks. C forms worker investigatesWelcome read-only.

Additional real rule11 finding: bike-profile expanded pressure still has lower legacy white Front/Rear cards duplicated below shared dial pair. C paid worker preparing minimal removal/replacement after your capture thaw. Root asks for thaw when fullcapture finishes; no source edits yet.

Confirmed A fullreport now complete332cases/build6; C thaws ONLY BikePressureSection + its test for actual duplicate recommendation fix. Other source remains frozen until your ready coordination. Please do not start build7 before C-ready.

ExactWelcome cause (forms worker): scripts/usability-check.mjs:119 exactbutton name Aanpassen/Adjust cannot match actual aria-label `Aanpassen: Binnenbeenlengte`/`Adjust: Inseam`. Select actual numeric carried field with /^Aanpassen: / or /^Adjust: /; fail explicitly if required editor absent. Product editor is correct.
