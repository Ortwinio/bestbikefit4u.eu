# Account dark pass (22)

Owned routes audited: pressure-calculator, gearing, saddle-selector, shoe-cleat-fit, settings, feedback,
standalone app. Presentation token changes only; engines, copies, queries, mutations and shared shell intact.

## Changes
- Feedback fixedlime hero now explicitly fixedink in both themes; remove conflicting foreground overrides
  on warning/destructive status pills so their paired semantic foreground wins.
- Gearing bike/input panel uses semantic secondary instead of fixed pale mint with inherited darkwhite text.
- Settings rawtuple text-color utilities replaced with semantic foreground/muted/primary/warning/success.
- Account pressure local CSS adapts legacy inner feature rawtuple classes to approved full --bbf-ui-* aliases.
  Parent tokens agent owns those global aliases. Shared pressure components unchanged. Missingprofile warning
  uses warning/ink fixedpair; result validation copy uses semantic foreground (was4.03:1 light ambertext).
- Saved front Gauge explicitly fixes --gauge-accent to brandpetrol onlime; dark rear retains lime arc.
  Harness asserts active SVG arc/background >=3:1 on both meters in both themes.
- Saddle, shoe-cleat and App already had safe lime/ink SVG/text pairing; no source change needed.

## Exact owned source/harness files
src/app/(dashboard)/feedback/FeedbackAccountPage.tsx
src/app/(dashboard)/gearing/GearingCalculatorForm.tsx
src/app/(dashboard)/pressure-calculator/PressureDashboardClient.tsx
src/app/(dashboard)/pressure-calculator/PressureDashboard.module.css
src/app/(dashboard)/settings/page.tsx
tests/visual/account-dark-c/README.md
tests/visual/account-dark-c/capture.mjs
tests/visual/account-dark-c/contrast.mjs
tests/visual/account-dark-c/entry.jsx
tests/visual/account-dark-c/runtime.jsx

## Validation/evidence
14targeted tests pass across real pressure route/wizard, gearing, settings and feedback suites.
Focused ESLint passes; CSSmodule token lint18files0rawcolorlines; allowned files<=120columns.
New harness copied existing account-batch4 without modifying it; actual components+unchanged shell,
realThemeProvider and fixtureuser.theme_preference. html.dark is asserted; no liveauth available.
72cases:18states x light/dark x1440/390. Includes28 mainroute cases, pressure actualwizard result and
savedgauges, loading/empty, feedback3tabs, settings realdelete dialog, App3platforms. No deletionconfirm.
Pressure wizard uses actualNext/hooked choices and realengine; fixture mutations only.
Text contrast samples solidbackground ancestors at4.5normal/3large; disabled/decorative/SVG/gradient
cases excluded. SVGgauges have separate3:1 assertion. Keyboardfocus styles recorded perroute firstcontrol.

Command: node tests/visual/account-dark-c/capture.mjs > /private/tmp/bbf22-account.log 2>&1
Outputs: plans/redesign-canvas/code-renders/20-dark-account-*.png and
plans/redesign-canvas/audit/22-account-browser.json. Manifest has CSS/bundlehashes, queries, contrast/focus.
No backend authorization/save/PWA-install claim. FeedbackPanelProvider openPanel onlystub, submission notvalidated.

Known external issue: src/components/layout/LanguageSwitch.tsx activeNL legacy rawtuple foreground causes
2.78:1 light and1.98:1 dark textcontrast; reported parent/tokens and explicitly categorized knownsharedfailure.
Parent instructed not to modify A-owned component nor wait. Shared sidebar settingsactive strip can be
partially obscured beneath existing loweraccount block at desktopheight; reported as shellB-owned observation.
No source changes to Header/Footer/shell/rootdictionaries/globals/engines; no commits.

Final72cases:0 runtime/query/theme failures,0 horizontal overflow,0 unexpected textcontrast failures.
Knownshared LanguageSwitch appears8times (filled/dialog x bothsizes x boththemes), recorded separately.
Savedgauge activearc ratios:front4.60:1 petrolonlime;rear12.80:1 limeonink, bothlight/dark pass.
Final successicon audit uses text-success-text in Settings and paired primary accent in pressure adapter,
not lowcontrast statusfill as foreground. Those successfulsave/connected branches are not capturedfixturestates.
All7 mainroutes visually inspected; light/dark parity maintained, realpressure5-stepresult intact.
