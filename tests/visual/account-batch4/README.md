# Account batch 20.4 visual fixtures

Run `node tests/visual/account-batch4/capture.mjs` while the existing Next server runs on port 3000.
`VISUAL_DEV_ORIGIN`, `VISUAL_PORT`, `VISUAL_FILTER` and `VISUAL_LOCALES` optionally narrow or relocate a run.

This bundles the actual seven route components, unchanged dashboard shell, shared UI, ThemeProvider and
ToastProvider. The standalone `/app` is intentionally outside the dashboard shell. Styles and local fonts
come from the real Next server, with bundled component CSS appended. The harness uses no live login,
Convex account, remote network access or persistent writes.

`runtime.jsx` supplies explicit deterministic Convex query fixtures. Unknown queries throw; query names,
mutations/actions and browser runtime errors are collected. Mutation results are simulated. This does
not validate backend authorization, real database saves, Strava linking, destructive account deletion
or installed PWA behavior. Example rider/bike names are visibly labelled. `FeedbackPanelProvider`
is stubbed solely to supply `openPanel`; feedback tabs use the real page, but feedback submission panel
opening/submission is not validated. Settings deletion opens the real confirmation dialog without
confirming deletion. App radio controls switch the real installation content.

Outputs: `plans/redesign-canvas/audit/20.4-renders/`, including full-page screenshots, mobile viewport
screenshots, deletion dialog viewports and `manifest.json` containing CSS/bundle hashes and checks.
NL covers all seven main pages at 1440/390, loading/empty states, all feedback tabs, deletion dialog and
App platforms. EN covers all seven main pages at both widths. Sidebar/root layout is reused rather
than recreated. Full-page captures place fixed mobile navigation at its viewport position; separate
viewport images show its actual bottom placement.

Final batch run: 48 cases passed with zero horizontal overflow, runtime errors or unknown query names.
The manifest records the complete per-case results and CSS/bundle SHA-256 hashes. Captures include the
final Settings mobile containment/link actions and Feedback shared segmented controls. All seven main
pages were inspected across desktop/mobile, with loading/empty/dialog/platform states captured as above.
