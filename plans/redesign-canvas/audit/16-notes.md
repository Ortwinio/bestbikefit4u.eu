# 16 — Shared components

Implemented on `redesign/canvas`, uncommitted for lead review. Canvas and drafts were read-only. Three subagents handled inputs, displays, and layouts; Codex C integrated the playground, shared Button/Card/Progress styling, border fix, and validation.

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed, including 214 contrast checks.
- `npm run test:unit`: 170 files / 681 tests passed (41 additional tests).
- `npm run build`: passed, 230 static pages generated. Final visual-only spacing changes are included in the final validation run.
- Headless Chromium: playground at 1440 and 390, saddle-height at 1440, and `/nl/profile` logged out redirecting to `/nl/login`. All HTTP 200 at final destinations; no page runtime errors, broken images or horizontal document overflow. Slider ArrowRight changes 84 to 84.5; segment selection updates radio state.
- Screenshots in `../code-renders/16-playground-desktop.png`, `16-playground-mobile.png`, `16-saddle-height.png`, `16-profile-login.png`. Inspected visually. HTTPS analytics/backend requests blocked during screenshots; no live sign-in or backend mutations performed.

## Integration and existing usages

- Existing `Button` API aliases/loading/disabled/render composition retained. Underlying primitive now has pill corners, 48px default/56px large heights, minimum 44px compact/icon hit areas, and 2px ink outline. Existing consumers inherit this style.
- Existing `Card` API and bordered alias retained; 24px corners, semantic soft border and white surface, display-font titles. Existing default padding preserved to avoid narrowing auth forms.
- `Progress` API retained; fixed raw tuple color declarations with `bg-border`/`bg-primary`, preserving determinate/indeterminate accessibility.
- **Lead border finding resolved:** `PublicSection` passed raw OKLCH channel tuples into CSS color properties, so browser invalid-value handling fell back to currentColor (ink). It now uses semantic `border-border/80`, `bg-card`, and text utilities. Browser computed border: `oklch(0.915952 0.0126119 164.778)` = brand rand, not ink. The old decorative gradient becomes a solid lime line. This is a component correction, not a global palette change. Other legacy raw-color usages outside these components remain for future page migration.
- Footer long calculator labels could extend to 419px on a 390px viewport. Added `min-w-0` and overflow wrapping to existing flex links; document now measures exactly 390px. Footer layout and content unchanged.
- Added all new component/type exports to `src/components/ui/index.ts`.

## Playground and publishing guard

`src/app/(public)/design-system/page.tsx` hosts a client playground with Dutch board copy and clearly labeled example values. No engine or database writes; the save interaction only toggles a local example state. Examples cover disabled/error sliders, scale ticks, both segmented variants, selected/unselected/disabled options, lime/ink result panels, all status chips, gauge, discrete scale, adjustment list, progress, cards, buttons and navigation.

Vercel production always calls `notFound()`. A production-mode non-Vercel/preview build requires server-only `DESIGN_SYSTEM_PREVIEW=true`; development/test environments allow access. Metadata is noindex/nofollow, and route policy excludes unprefixed/NL/EN paths from sitemaps. Guard behavior has dedicated tests.

## Component APIs and board decisions


# Step 16 input components

Owned files: src/components/ui/Slider.tsx, SegmentedControl.tsx, Selectable.tsx, OptionCard.tsx, StepCard.tsx, Inputs.interaction.test.tsx.

## APIs

- Slider preserves existing props/ref and low-level reexports. New `unit?: string`, `ticks?: readonly { value: number; label?: string }[]`. Numeric `valueLabel="80 cm"` is automatically split into large DM Mono number and small muted unit; word value labels use body font. `valueLabel` remains the accessible value, with explicit unit appended. `aria-valuetext` caller override wins. Native Base UI keyboard behavior is preserved. Error context now reaches the actual native range input; tooltips are excluded from its accessible name. Label-generated IDs replaced with useId IDs so repeated identical labels remain unique. Track hit area is 44px, visible thumb 30px with petrol ring, no overflow clipping. Tick endpoints align inward.
- SegmentedControl keeps RadioGroup API and existing child component. New `variant?: "default" | "strong"`. Radio semantics and keyboard selection retained; 44px segment minimums. Soft #EEF3EF track, white selected default, strong ink/white. Dark mode uses muted/card semantic surfaces for the default variant.
- Selectable preserves all APIs and modes. Card selected state is lime-soft with fixed petrol border and ink text; unselected check is hidden, decorative SVG hidden from AT. Existing raw tuple CSS uses fixed by semantic color utilities. Disabled states visually muted, touch minimum 44px. Pill/segment APIs retained.
- OptionCard is a thin forwardRef wrapper around Selectable, fixes variant=card, accepts every other Selectable prop and `showCheck?: boolean` default true. Supports existing button/radio/checkbox modes, custom trailing content wins. Descriptions naturally wrap on small widths rather than clipping meaningful copy.
- StepCard: `number: number`, `title: ReactNode`, `description?: ReactNode`, standard section HTML attrs and children. Named section plus h2 heading, lime numbered circle, white/semantic-card surface.

Exports to add: OptionCard/OptionCardProps, StepCard/StepCardProps. No index edit by this agent.

## Validation

- Typecheck passes after narrowing RadioGroup callback's unknown value in test.
- ESLint on all six owned files passes.
- Three focused suites pass, 10 tests total: existing Slider and Selectable static contracts plus new interaction suite.
- Slider: ArrowRight, End, Home, step precision, bounds, disabled callback guard, unique labels, unit-valuetext, actual input aria-invalid, tooltip separation.
- Segments: radio group name, selected state, arrow-key change/focus and skipping disabled option.
- OptionCard: pressed state, click callback, disabled state, optional check.
- StepCard: named region, heading, numbered font, child controls.

No canvas/drafts/global CSS changes, no commits. Existing usages of Slider, SegmentedControl and Selectable automatically receive styles with API compatibility retained. New OptionCard and StepCard are available to the playground/next page implementations.


## Shared display components

Exports to add to UI barrel: `ResultHero` / `ResultHeroProps`, `ResultTile` / `ResultTileProps`, `StatusChip` / `StatusChipProps`, `Gauge` / `GaugeProps`, `SizeScale` / `SizeScaleProps` / `SizeScaleOption`, `AdjustOrder` / `AdjustOrderProps`. Existing MeasurementTile additionally exports MeasurementTileProps.

- ResultHero: `{label, value:string|number, unit?, subtext?:ReactNode, variant?:"lime"|"ink", children?, className?}`. Labelled section + definition list; big mono number, smaller unit; lime surface with ink or ink with lime figure. Children support visual/advice composition without engine coupling.
- ResultTile delegates to MeasurementTile, no duplicate renderer. Shared props `{label, value:string|number|null|undefined, unit?, status?:ReactNode, className?}`. Existing null/undefined suppression preserved and zero retained; white semantic card, dl/dt/dd, mono figure and muted unit. Optional status line uses body font.
- StatusChip: `{status:"ok"|"warn"|"deviation", children, ...HTMLSpanAttributes}`. Exact brand lime/yellow/salmon and ink; supplied visible text distinguishes status without color. Live role optional (avoids unsolicited announcements for every decorative chip).
- Gauge: `{label,value,min?=0,max?=100,unit?,valueText?,locale?="nl-NL",className?}`. Labelled role=meter; ARIA limits and current value; SVG geometry follows bounded percentage (supports nonzero minima). Nonfinite input or max<=min throws RangeError; out-of-range finite values clamp consistently. Dutch decimal comma by default, locale override for EN. Decorative arc/endpoints hidden from AT; valueText can supply spoken description.
- SizeScale: `{label,options:readonly {value:string|number,label?:string}[],recommended:string|number,borderline?:readonly (string|number)[],unit?,locale?="nl-NL",recommendedLabel?="advies",borderlineLabel?="meetgrens",className?}`. Read-only semantic list with aria-current recommendation; ink recommendation, white unselected sizes, petrol border for borderline, visible textual distinctions. Wraps for narrow screens. Numeric default labels use decimal comma; custom labels and translated hints supported.
- AdjustOrder: `{title?="Pas in deze volgorde aan",steps:readonly {title:ReactNode,description?:ReactNode}[],className?}`. Named section, h2, ordered list; decorative numbered petrol-soft circles and body text. Advice always supplied by caller, never invented/calculated inside the display component.

### Existing usages affected
MeasurementTile appearance changes in BikeGarageOverview, BikeFitHistorySection, BikePressureCard, dashboard and settings (larger mono figure, 24px card corners/padding). API and missing-value behavior unchanged. StatRow keeps dt/dd and missing-value behavior, adopts semantic colors; numeric number values use DM Mono while strings remain body font so descriptive riding labels do not become monospaced. StatRow used by BikeWithFitHistory, BikeGarageOverview and pressure wizard StepResult. Progress retains its role/progress API; final integration fixes its track/fill color utilities (see integration section). Gauge is a distinct bounded meter, not a duplicated progressbar.

### Deliberate adaptations
- Responsive wrapping instead of fixed canvas columns prevents mobile overflow.
- ResultTile/MeasurementTile semantic cards follow dark theme. Lime/ink result panels and chips retain fixed brand surfaces with contrast-safe text in both themes.
- Gauge uses existing exact brand border/petrol instead of historical board-only green #B6D94C (brand palette wins).
- Numeric ResultHero/MeasurementTile values retain caller formatting; callers pass formatted strings for localized measurements/ranges, and can wrap numeric text in subtext/status in font-mono spans.
- No page layouts or engine rules migrated.

### Validation
`npx vitest run src/components/ui/display.test.tsx`: 16 passing cases for each new/restyled component, semantic labels, nullable/zero compatibility, meter ranges/clamping/invalid input, recommendation/borderline labels, ordered advice and font separation. Targeted eslint for all nine changed TSX files passes. Parent runs full validation and visual review.

Mobile QA follow-up: SizeScale uses an explicit bounded wrapping flex container and 4.5rem flexible basis, min-width zero, maximum width 100%, wrapping labels; removes fixed option minimum that could push the mobile layout. Unselected sizes now white; recommendation ink and borderline petrol outline. Gauge unchanged.


## Layout components

- `ToolsTabBar({activeTool, locale = "nl", className?})`: `ToolTab` is the seven `PublicCalculatorId` values plus `"more"`. Eight navigation links in approved order, ink current page, white pill, horizontally scrollable mobile row, 44px minimum links and keyboard focus rings. Calculator route registry resolves Dutch tire pressure to `/nl/bandenspanning-calculator`; More links to the first real extra tool `/nl/calculators/power-speed`. English labels/routes supported.
- `MoreToolsNav({activeTool, locale = "nl", className?})`: `MoreTool` is `power-speed | climb-planner | ftp-wkg | fuel-hydration`. Four outlined pills in approved order, current page ink; horizontally scrollable. Caller mounts only on those four tools, above eyebrow via the layout navigation prop.
- `ConfiguratorLayout({eyebrow, title, description?, navigation?, inputs, results, stickyResult?, className?})`: content props are ReactNode. Single h1 question, navigation above eyebrow, 540px input column at xl and flexible result column, mobile stacking, 64px desktop tool margins at 1440px. Optional bottom sticky summary at mobile/tablet sizes, safe-area padding. Does not introduce a nested main landmark.

Exports to add to ui/index.ts: ToolsTabBar + types ToolsTabBarProps, ToolTab; MoreToolsNav + types MoreToolsNavProps, MoreTool; ConfiguratorLayout + type ConfiguratorLayoutProps.

No existing usage changed: new components are opt-in for subsequent board implementation. Deviations: Next links replace canvas links, responsive stacking begins below xl to keep the 520–560px input width from squeezing results; English labels included for locale compatibility. Direct brand border color `--bbf-rand` avoids legacy OKLCH-channel variables being interpreted as complete colors. Native link navigation intentionally uses nav/aria-current rather than interactive tab roles.

Verification: 9 focused unit tests passed in 3 files. Covers all active subnav states, real localized links/order, single active page semantics, heading/content order, optional sticky result rendering, no duplicate main landmark.



## Final integration refinements

StepCard spaces child fields, preserving children composition. Playground separates segment examples into separate rows and formats decimal slider values in Dutch. SizeScale unselected cells are white, recommended cell ink, borderline cell outlined in petrol; bounded wrapping prevents overflow. Configurator heading/subtext uses semantic colors for dark-mode compatibility. Sticky result uses semantic card colors.
