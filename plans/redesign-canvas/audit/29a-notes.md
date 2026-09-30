# 29a — Shared mobile touch targets

C owns the shared UI fixes only. No gearing/settings/feedback or bike page files edited; no commit/push.

## Changes

- Tooltip trigger now has a 44×44 minimum hit area and cannot flex-shrink. The inner help icon stays
  16×16, with its existing 20×20 visual wrapper; keyboard naming/description wiring is unchanged.
- Prototyper Input defaults to h-11 and min-h-11 (44px).
- Prototyper SelectTrigger defaults to h-11; all size variants inherit min-h-11. Explicit h-8/h-10
  styles cannot lower the actual height below the shared floor. Larger caller sizes remain available.
- Input/Select wrappers continue forwarding className. Grepped consumers: PublicFormFields uses h-11;
  BikeForm/BikeWheelsetManager/BikeGeometryLibraryFields and fit results use min-h-11; login uses
  min-h-[52px]. These existing overrides are compatible and were not changed.

## Regression checks

- 10 focused Tooltip/Input/Select tests pass. They cover trigger semantics/icon sizing, default and
  variant minimums, and explicit h-8/h-12/min-h-[52px] class merging.
- Entire shared UI/prototyper test set: 87 tests in 21 files pass.
- Typecheck and full lint pass (including contrast and CSS-module tokens).
- Isolated production build and final sweep exit 0. No overflow in any of the 20 owned-route cases.
- Mobile bike/manual/import/settings captures and a desktop import capture visually reviewed;
  input spacing and surrounding cards remain intact.

## Sweep and provenance

Requested command, with an isolated port for concurrent release work:

```sh
node tests/visual/final-sweep/sweep.mjs --filter=/,/bikes/new/manual,/bikes/import,/settings --output=plans/redesign-canvas/final-sweep/29a --label=29a --port=4329
```

The existing substring filter treats `/` as a match for all 70 routes. Thus the command runs the full
280-case matrix, not only the five requested routes. No filtering/check logic was changed by C.
The first attempt collided with a parallel Next build lock; it was left untouched. The retry uses
port 4329 and a new source snapshot. Parallel B page fixes and D TLS harness changes are included;
overall improvements outside the owned shared targets must not be attributed to C.

Before: `final-sweep/28-release/report.json`. After: `final-sweep/29a/report.json`.
A compact before/after extract is saved in `29a-touch-targets.json`; PNGs stay local and out of the manifest.
Account routes use actual components and production CSS with mocked auth/Convex; no live persistence
or authorization is asserted. Touch checks apply at 390px, not desktop. Initial states only.

## Before/after owned mobile targets

| Route | Before failing mobile cases | Before undersized targets | After failing cases / targets |
|---|---:|---:|---:|
| `/` | 2 | 2 (20×20 help buttons) | 0 / 0 |
| `/bikes/new/manual` | 2 | 10 (36px controls) | 0 / 0 |
| `/bikes/import/marktplaats` | 2 | 2 (36px input) | 0 / 0 |
| `/bikes/import/passport` | 2 | 2 (36px input) | 0 / 0 |
| `/settings` | 2 | 2 (36px input) | 0 / 0 |
| **Total NL/EN at 390** | **10** | **18** | **0 / 0** |

Owned routes: all 20 cases at 1440/390 pass every applicable check; all 10 mobile target checks pass.
Whole run: **280/280 cases without failures**; touchTargets **138 pass / 0 fail / 142 skip**
(before: 125 / 13 / 142). Axe: 276 pass / 0 fail / 4 expected-404 skips. All 280 overflow checks pass.
This is combined evidence with B/D, not a claim that C fixed every original issue.

Production source hash: `619eb8249872556a3093298ee758ae298238c5ce94442728858b8edeed615a69`;
build ID `eLDpwmF4vUcKCnS0rh8UL`; snapshot `/tmp/bbf-final-sweep-619eb8249872556a`.
Normal sweep cleanup completed. The initial build-lock failure was infrastructure contention, not an
app failure; no process was interrupted and no check was suppressed.

Exact changed-file manifest: [files-29a.txt](files-29a.txt).
