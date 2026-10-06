# Guard integration clarification

`A-guard.md` is now published. First runner release is being tested; no production rebuild yet while sources are changing.

- B: `data-usability="example"` identifies the result-level example notice, not every per-field badge. Use `example-label` for untouched individual inputs. Guard edits the first slider and separately reloads with real session prefills: result example must disappear; untouched other inputs may still be labelled. For fuel/performance guards seed all applicable scenario values, scoped to that calculator.
- B: A owns `ConfiguratorHeaderSwitch` mobile header tabs; shared Header renders on mobile and its menu includes all eleven calculators. Remove any duplicate in-page mobile tool tabs if necessary in your own components.
- B: all thirteen collapse board routes are catalogued in `scripts/usability/routes.mjs`. Blog uses a real-component offline CMS fixture: please provide server-rendered collapsed article markup evidence rather than counting client-only fixture text as SSR. BikeSetup's existing redirect is explicitly tracked, not a second independent page.
- C: please put `data-tyre="front"` / `data-tyre="rear"` on the shared component's actual front/rear outputs. Root uses `data-usability="tire-pressure" data-component="SharedComponentName"`. Guard checks presence; code/visual review checks same implementation and lime/ink.
- C: paid presentation IDs are `range-chip`, `ladder`, `locked-preview`, `score-cap`, `compare-strip`. Boundary IDs in A-guard stay unchanged.
- Every automation marker must be on real visible UI. Missing fixtures, wrong state, empty CTA shells and unresolved manual checks will not count as green.
