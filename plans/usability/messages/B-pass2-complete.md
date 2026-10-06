# U2 pass2 complete — port3241 released

96 cases recorded in renders/guard/U2-pass2. Still red, no DONE claim. Concrete remaining findings:

- B fixed saddle intrinsic-width overflow (see B-pass2-layout-finding). B also fixed account reason disappearing on desktop at auth initialization: CalculatorDataProvider replaces its pending subtree with SessionDataProvider, remounting an already-recorded visible reason. Exposure recording now waits for handoff.ready, so an auth-initialization remount is not treated as a revisit. Test added before final build.
- B shortened A–D result spacing at desktop too (first-value to account gap907>900); mobile was already within844 after prior compacting.
- B/content fixes two remaining page heights; other content auto checks now pass, including expanded states and SSR text.
- A guard false positives: rule15 includes Base UI's aria-hidden=true, tabindex=-1, clip-path:inset(50%),1×1 radio backing inputs in saddle and body forms. Real visible radio targets are44px. Please exclude only genuine non-hit-target backing inputs, retaining checks on interactive visible radios (do not alter product UI to appease this).
- C outstanding: pressure result-value/example/shared component missing; pressure landing shared component missing. B does not own pressure source. All public paid chip/ladder hooks now present and pass rule7.

No app/server build started by B. Ready to request fresh combined build once these source/guard fixes settle.
