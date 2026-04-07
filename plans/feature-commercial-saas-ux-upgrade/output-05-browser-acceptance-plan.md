# Browser Acceptance Plan

Date: 2026-04-08

## Objective

Run the missing browser-based acceptance pass on the touched public/auth routes so [output-04-final-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-commercial-saas-ux-upgrade/output-04-final-closeout.md) can move from `not ready` to `ready`.

This plan covers:

- route rendering and layout quality
- light/dark/system theme behavior
- Prototyper-only visible UI compliance
- icon consistency on touched public surfaces
- analytics and conversion-path verification

## Subagent Assignment

### Agent A: Route Coverage

Owns:

- route rendering sanity
- mobile/desktop layout checks
- page-specific UX assertions

Routes:

- `/en`
- `/en/login`
- `/en/pricing`
- `/en/calculators/bike-fit`
- `/en/calculators/saddle-height`
- `/en/calculators/frame-size`
- `/en/calculators/crank-length`
- `/en/bandenspanning-calculator`
- `/en/faq`
- `/en/contact`

NL spot checks:

- `/nl`
- `/nl/login`
- `/nl/pricing`
- `/nl/faq`
- `/nl/contact`

### Agent B: Theme, Visual System, Icons

Owns:

- light/dark/system checks
- public surface consistency
- visible Prototyper-only compliance
- icon-role consistency

Primary routes:

- `/en`
- `/en/login`
- `/en/pricing`
- `/en/calculators/bike-fit`
- `/en/faq`
- `/en/contact`

Secondary spot checks:

- `/en/calculators/saddle-height`
- `/en/calculators/frame-size`
- `/en/calculators/crank-length`
- `/en/bandenspanning-calculator`
- `/nl`
- `/nl/login`
- `/nl/pricing`

### Agent C: Analytics and Conversion Flow

Owns:

- CTA destination verification
- tracked CTA sanity
- auth start-flow preservation
- calculator next-step conversion bridges
- logged-in versus logged-out path sanity

Primary routes:

- `/en`
- `/en/login`
- `/en/pricing`
- all touched EN calculator routes
- `/en/faq`
- `/en/contact`

NL spot checks:

- `/nl`
- `/nl/login`
- `/nl/pricing`
- one NL calculator
- `/nl/faq`
- `/nl/contact`

## Test Environment

- Browser: Chromium-based browser
- Viewports:
  - mobile: `390x844`
  - tablet: `768x1024`
  - desktop: `1440x900`
- Theme modes:
  - `light`
  - `dark`
  - `system` with OS light
  - `system` with OS dark
- Browser profile:
  - clean logged-out session
  - second pass with authenticated session for CTA path sanity
- Tools to keep open:
  - devtools console
  - devtools network tab
  - devtools application/storage pane when checking theme persistence or auth path state

## Execution Order

### Phase 1: Logged-Out Route Coverage

Agent A runs first across all EN routes in mobile and desktop:

- page renders without crash, hydration issue, or blank state
- no clipped text or horizontal scroll
- primary headline and main CTA are visible
- touched pages feel like one coherent public SaaS system

### Phase 2: Theme and UI System

Agent B runs after the first route pass on the primary routes:

- light mode
- dark mode
- system mode with OS light
- system mode with OS dark

Checks:

- hero/cards/CTA bands remain coherent
- no visible legacy-looking component appears
- icon treatment is consistent by role
- contrast remains acceptable for hero text, muted text, outlined buttons, inputs, help text, and disclaimers

### Phase 3: Conversion and Analytics

Agent C runs after route rendering is judged stable:

- click homepage primary and secondary CTAs
- verify login/start path messaging and submission flow
- verify pricing CTA intent and destinations
- complete minimal valid inputs on every calculator and click result/next-step CTAs
- click FAQ and contact next-step CTAs
- repeat key CTA checks while authenticated

Checks:

- CTA destination is correct
- locale prefix is preserved
- analytics event fires once
- `sourceTag` or equivalent auth attribution is preserved where expected
- logged-in users do not hit broken anonymous-only paths

## Per-Route Acceptance Checks

### Homepage

- primary CTA leads to first value, not a returning-user wall
- calculator/value-first surface is visible early
- trust/proof appears above deep-scroll content
- quick-check/recommendation area is usable and visually aligned

### Login

- page reads as create-account plus sign-in, not sign-in only
- passwordless explanation is visible
- support reassurance is visible
- fields and helper/error states remain readable in all themes

### Pricing

- Free vs Pro is understandable in rider-outcome terms
- proof/confidence module is visible near decision areas
- plan hierarchy is clear
- CTA destinations and intent are unambiguous

### Bike-Fit Calculator

- calculator form is usable
- trust cards remain visually aligned
- result-to-next-step bridge is commercially clear

### Saddle-Height Calculator

- conservative baseline framing is clear
- CTA after calculator points to the right next step
- FAQ/trust sections still feel like part of the same funnel

### Frame-Size Calculator

- shortlist framing is clear
- next action after estimate is obvious
- CTA band and trust cards match other calculators

### Crank-Length Calculator

- form uses the same public/prototyper form language
- no one-off legacy feel remains
- CTA hierarchy matches the other calculators

### Tire-Pressure Calculator

- hero, form, FAQ, related links, and CTA band feel like one system
- primary CTA after value is clear
- secondary CTA and login link support the funnel without competing

### FAQ

- still answers real questions
- now functions as a trust-and-conversion page
- next-step CTA is visible and appropriate

### Contact

- support expectations feel confident enough for paid prospects
- support reassurance and next-step CTA are visible
- contact and trust blocks match the public UI system

## Manual Evidence To Capture

Required screenshots:

- homepage light
- homepage dark
- login dark
- pricing light
- one calculator light
- one calculator dark
- FAQ dark
- contact light
- mobile menu open
- cookie banner visible
- any reachable feedback dialog or sheet

Required notes:

- route-by-route pass/fail
- any CTA that misroutes or loses locale
- any visible theme inconsistency
- any analytics duplicate/missing fire
- any contrast issue that affects comprehension

## Failure Conditions

Block readiness if any of the following occur:

- broken route render, blank state, hydration issue, or layout collapse
- homepage still behaves like login-first instead of value-first
- login still reads like a returning-user wall
- pricing proof is hidden or CTA hierarchy is confusing
- any calculator feels isolated with no clear next-step bridge
- FAQ/contact still behave like support-only dead ends
- system theme is inconsistent across routes
- visible legacy-looking UI appears on touched surfaces
- icon meaning or icon sizing is inconsistent across public trust/feature surfaces
- CTA click fires duplicate analytics or no analytics
- locale prefix is lost after navigation
- auth attribution is dropped in the login/start flow

## Pass Criteria

The closeout artifact can be flipped to `ready` only when:

1. Agent A marks all required routes pass on mobile and desktop.
2. Agent B marks light/dark/system checks pass on the primary routes.
3. Agent B confirms no visible non-Prototyper UI regressions on touched surfaces.
4. Agent C marks CTA destination and analytics checks pass for homepage, login, pricing, calculators, FAQ, and contact.
5. Agent C confirms logged-in and logged-out CTA paths remain coherent.
6. Required screenshots and notes are saved.
7. No blocking issue remains open.

## Closeout Update Rule

After the browser pass:

- update [output-04-final-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-commercial-saas-ux-upgrade/output-04-final-closeout.md)
- replace the current manual-QA gap with the completed browser evidence
- change merge recommendation from `not ready` to `ready` only if all pass criteria above are met
- if any blocking issue is found, keep the recommendation at `not ready` and add the failing route plus reproduction notes
