# U1 build7 header and sidebar review

## Scope and provenance

Read-only review of actual build7 screenshots, plus an isolated read-only sidebar operability check. No application or harness files changed. This is a scoped review, not approval of unseen pages or all accessibility criteria.

- Build ID: `rFjJbzOipHKt5iD79GNZl`.
- Application hash: `65b5891cbb09ae1dde423c2aa70c17a0a0030a7baab8c93699c59e457af8a98b`.
- Report source hash: `c4ae157e6f2a04af8df46dbeb9b6b4268e05f46ce066f88afdf53c6393481442`.
- Build interval: 2026-10-06 12:45:14.828–12:45:42.274 UTC.
- Evidence: `plans/usability/renders/guard/build7/report.json`, whose build provenance is valid.
- Images below were opened at original detail; hashes identify the actual reviewed PNG bytes.

## Account header: PASS for reviewed states

Viewed NL and EN dashboard at 390 and 1440, plus both 390 menu-open states. Both mobile headers visibly contain logo, lime initial avatar/profile access, and menu in one row. Report measurements are 390×64 for the header and 44×44 for the menu trigger. Language selection is inside the menu. Compact profile strength rings are below the header; the larger dashboard ring belongs to the content, not a second header row.

Both mobile menus show localized navigation, language selection and close control without observed text clipping. This satisfies the literal mobile avatar/profile-access part of rule 5 in these reviewed states, rather than relying only on visual resemblance to the canvas. Desktop layout remains a sidebar layout. The four dashboard records report no target-size or contrast failures and no horizontal overflow.

This is not a blanket axe pass: the report also records moderate best-practice landmark findings, including duplicate Riderprofiel region labels and content outside landmarks. These are separate from the scoped header/target checks.

## Sidebar operability: PASS NL and EN desktop

An independent temporary diagnostic used the real `prepareAccountFixtures` implementation, actual compiled build CSS and the C runtime extension. It loaded `/nl/dashboard?access=free-enforced` and `/en/dashboard?access=free-enforced` at 1440×900. The production preview origin was HTTPS on port 3242, fetched through `createPreviewFetch` with its exact local certificate; TLS verification was not disabled globally.

For both locales:

- Sidebar width 264, height 900; outer scrollHeight 1775 and clientHeight 900.
- Zero nested actual scrolling regions.
- All 21 navigation/language links were scrolled into view and keyboard-focused; each was fully within the viewport and at least 44px high.
- Logout was reached and focused, not activated: Uitloggen / Sign out.
- Final sidebar scrollTop 875 while body scrollY remained 0.

The diagnostic allowed only read requests to its own fixture origin. No submission or logout was activated; browser contexts, browser and temporary fixture server were closed. The diagnostic is `/private/tmp/u1-build7-sidebar.mjs`, not a repository change.

## Feedback parity and limitations

In `dashboard-nl-390.png` and `dashboard-en-390.png`, feedback follows the page content instead of covering the 59% ring/reliability text seen in the earlier fixture discrepancy. Mobile parity passes for these screenshots. Desktop feedback remains floating. The NL1440 capture suggests proximity/possible overlap with the lower-right edge of the flexibility-card “Bekijk alle gegevens” pill; this is an observation for the separate U3 reviewer, not a claim that all dashboard actions were tested. No feedback dialog or submission is approved by this review.

## Additional content sample

Viewed only NL390 Guides and FAQ, each default and details-open. Guides default presents the short introduction and collapsed route/topic sections; the expanded capture exposes the guide-card content. Report evidence lists three collapsed sections with SSR content. The very tall expanded capture was sampled for structure, not exhaustively proofread card by card.

FAQ default collapses question groups while retaining the safety/pain answer. Expanded answers are readable, including pricing/report limitations. Twelve collapsed sections have SSR content according to the report. The three visible trust blurbs (“Praktisch & actueel”, “Eerlijk over grenzen”, “In jouw taal”) match `.fq-trust` in `canvas/project/FAQ.dc.html`; they are a canvas-directed exception, not an invented failure against general collapse advice. The Guides board likewise contains its three-part introductory disclosure. No mobile-specific FAQ or Guides board exists in the inspected canvas directory.

Both sampled pages retain the compact header and show no reported horizontal overflow, target-size or contrast failures. Some long Dutch calculator names wrap within words in the footer, a cosmetic observation only. No EN or desktop content-page visual approval is implied. These samples do not independently establish every functional assertion under rules 12, 14 or 15.

## Screenshot manifest

All filenames are relative to `plans/usability/renders/guard/build7/`.

| Screenshot | SHA-256 |
| --- | --- |
| dashboard-nl-390.png | `844a22ccfd7399aa0f179cb12cb9d9a40b177fd682c4dcdf0d11550c528d0ce3` |
| dashboard-en-390.png | `25c3f99c4054cb57cdaeeed20053c56febf32352fcc9709a88419d90062dcabf` |
| dashboard-nl-1440.png | `c64a195e32054379200eba4d8fba5ff7fa1f1a286ac69cfd7159bc559d6ad6c2` |
| dashboard-en-1440.png | `9d0c0bc6a448c19022a4b8284592364e7d74773e99b285239a02a5105a549b75` |
| dashboard-nl-390-menu-open.png | `9e13e66a12b5a60a585f2afaef2b62d6d91811e1d0a17b6025bce9ed4f2ce54f` |
| dashboard-en-390-menu-open.png | `b42d498f00cb213308795ad08c48ecf9e6477bdc3001609c8a42b68058d1a2cf` |
| guides-nl-390.png | `76ec01dc4e79ffdd2fe0c4372dd33b0a492128613ef5496850b6f271c2952566` |
| guides-nl-390-details-open.png | `53a247fadf4e9022127b7be6712d5aacea6a7b836238975fd0f5b2aeea744ac2` |
| faq-nl-390.png | `51af516673ae8f06f9e462fd34fd641de1fe76922552b716f789f32e4b837118` |
| faq-nl-390-details-open.png | `06ad96aa505e7f02cfa6ad7c92182de8b8e6fa991a254c394d08ed8677d2af2f` |
