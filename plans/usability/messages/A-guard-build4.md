# Build 4 — full usability guard result

**NOT GREEN. No DONE or release approval.** Build `ZMi-ugmOH7sYvFoJ5fcU5` passed with matching application-source hashes before/after compilation. Full guard attempted196 cases:49 routes ×NL/EN ×390×844/1440×900. Raw evidence: `plans/usability/renders/guard/build4/report.json` and screenshots (ignored).

## Freeze and coverage

B was frozen. No C freeze/readiness message was present at build start. C-owned application files subsequently changed during the sweep (pressure components, profile provenance/rings, welcome, history, compare and account saddle files). The guard correctly records `Source changed during this run; rerun on a frozen tree`. Build4 is historical evidence, **not approval of those newer changes**.

68 account-fixture cases failed before rendering due to A-owned adapter defects: a server-only marker in the synthetic client bundle and a missing read-only pricing access query. Their rules are **unmeasured**, not passing. A has corrected the adapter and is validating it. A fresh integrated build/sweep requires C's actual source freeze. The checkout/public fixtures rendered; no console/page errors occurred in the128 non-account cases.

## Per-rule results

Counts are failed automatic checks in rendered cases. “Manual pending” is not green. Account gaps apply throughout; especially rules6/7/9/10/11 cannot be signed off from the public subset.

| Rule | Automatic result | Manual/coverage status |
|---|---|---|
| 1 — account reason + next step | FAIL:4 pressure cases; missing result marker prevents gap measurement |44 reviews pending; C pressure integration pending at build time |
| 2 — collapsed, server-rendered explanation | No failures in96 calculator/content cases |96 reviews pending |
| 3 — routes, reuse, real handoff | No failures in44 calculator cases |44 reviews pending; actual edited handoff checked before seeding |
| 4 — homepage routes +11 direct links | No failures in4 home cases |4 visual reviews pending |
| 5 — mobile single-row header | FAIL:10 checkout mobile cases lack menu control |Checkout has64px back/progress header; compare with its dedicated canvas before deciding product change; account coverage missing |
| 6 — paid limits +price | UNMEASURED: required account cases did not render |Not “not applicable” release approval |
| 7 — contextual paid forms | Public range-chip/ladder checks pass |44 reviews pending; account forms unmeasured |
| 8 — examples clear on edit/reuse | FAIL:4 pressure cases |44 reviews pending |
| 9 — numbers use sliders | No failures in rendered cases |Account forms unmeasured |
| 10 — preselected measurement method | No failures in rendered cases |Account forms unmeasured |
| 11 — shared pressure display | FAIL:8 public pressure/landing cases |14 manual checks pending, including report/email surfaces; account cases unmeasured |
| 12 — no paid urgency/overlays | No failures in rendered states |128 reviews pending; leave-notice behavior still requires evidence |
| 13 — visible safety | No failures in tested public full/Quick-fix states |12 reviews pending; account safety unmeasured |
| 14 — real claims/current prices | Forbidden-string checks pass in rendered states |128 reviews pending; known login free/full-report claim remains unapproved |
| 15 — targets/contrast | No automatic failures in rendered cases/states |128 reviews pending; known mobile feedback text overlap remains unapproved |

All40 cases for B's10 non-pressure calculators pass automatic checks, including edited/reused/next-calculator states. All48 non-pressure content cases pass automatic checks. These are useful regression results, not blanket manual approval.

## Other combined gates

- PASS: production build, typecheck, full lint, contracts610, Convex standalone tsc.
- Unit: **FAIL**,4,253 passed/20 skipped/2 failed. Both are outdated NL/EN guides-hub `entry.pageBrief` assertions (`A-build4-unit-finding.md`); fix queued to B/content.
- PASS: local SEO875pages/0findings; local domain684redirects/0findings;42 bilingual email previews/84screenshots.
- No deployments, commits, environment edits or real mail.

## Next actions / owners

- A: validate account adapter correction; use the next frozen integrated tree for a new full sweep. Fix feedback overlap/login claims once shared-file scope is confirmed; no automatic manual approvals.
- B: update the2 guides-hub test assertions after the snapshot; review calculator/content screenshots and remaining manual requirements.
- C: publish actual readiness/freeze and account paid/form/shared-pressure/report/email evidence. Current edits appeared during build4's sweep and are not covered by its production build. Recheck dedicated checkout-header canvas versus general menu rule with A.

## Post-run clarification

C's checkout-canvas note is verified: back/progress intentionally replaces marketing navigation. A corrected rule5 to check that dedicated back target and64px header rather than require an unrelated menu; see A-checkout-canvas-rule.md. The historical table/raw report above is not rewritten as if the original run passed. C is now active but explicitly not frozen; its runtime extension will supply missing modern account reads and distinct paid-enforcement scenarios.
