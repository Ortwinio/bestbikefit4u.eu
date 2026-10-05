# Q3 — Quick Fix and combined QA

Status: **DONE**, 5 October 2026. Q1/Q2/Q3 integrated; combined candidate gates pass. No release activation performed.

## Quick Fix

- Top NL/EN Quick Fix route selector; a single stable calculator instance preserves height, inseam and plausibility confirmation when switching to Full advice.
- Height-only compact result, optional inseam using B's same card/checks, C's same model and RangeBar. No second formula or warning implementation.
- Four practical steps: measure along the seat tube from bottom-bracket centre; loosen/set/tape/printed torque; heel/ball-of-foot check; maximum 5 mm per ride when changing more than 10 mm.
- Safety text is always visible, not in a disclosure. Full-advice button returns focus to the mode selector. Token-only styling, 44px buttons, shared public-form gutters.
- Existing analytics pattern extended with quick_fix_used and inseam_added. Marketing consent required; real interactions only, deduplicated, no body measurements/query data. Server rejects extra payload fields and unrelated calculator sources.

## Integration review and fixes

- Q3 caught initial 190 cm upper-bound rounding to835 instead of required840. C fixed presentation rounding; exact worked examples now pass: 789±49 (740–840), 786±23 (765–810), next-step ±23/±18.
- Written open-warning uncertainty rule takes precedence over the board script: 3%B while yellow warning remains open and after large override; dashed zone retained. See C-model-contract.md.
- B preserves account implementation/old CSS separately. Only the public saddle calculator uses this new model; other calculators and account engine are unchanged.
- A updated three stale regression tests, not application behavior: initial saddle handoff CTA is absent until a valid/confirmed inseam, metadata no longer claims public core input, welcome handoff uses actual height/inseam sliders. The latter still exercises login and profile import, now proving declared height191 plus measured inseam89.5 travel without URL values.
- SEO review removed obsolete safe-band/extra-input descriptions through B's page work; independent server-HTML checks verify metadata in head, canonical/hreflang, FAQ/HowTo/WebPage JSON-LD and visible copy.

## Combined final gates

All executed in /Users/ortwinverreck/Developer/bikefitboost-reliability after integration. Local ignored logs: audit/Q3-<gate>.log.

| Gate | Result |
|---|---|
| npm run typecheck | PASS |
| npm run lint | PASS, including runtime, tooltip, contrast, CSS tokens, images, brand/domain and price guards |
| npm run test:unit | PASS:433 files passed,1 skipped;3774 tests passed,20 skipped |
| npm run test:contracts | PASS:53 files,581 tests |
| standalone tsc -p convex/tsconfig.json --noEmit | PASS |
| npm run build | PASS |
| seo-crawl-check.mjs --local --skip-build --label=q3-final --delay=0 | PASS:875 page/user-agent checks,zero findings |
| domain-migration-check.mjs https://bikefitboost.com https://bestbikefit4u.eu --local --skip-build --label=q3-final | PASS:684 redirects,zero findings |
| Real-page visual/axe/SEO sweep | PASS:36 scenarios,zero axe findings at any severity,zero overflow or unexpected application/hydration errors |
| git diff --check | PASS |

Build and crawls use process-only NEXT_PUBLIC_SITE_URL=https://bikefitboost.com, NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:9 and NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:9. Environment files were not changed. Crawls and visuals reuse the completed offline production build.

Existing non-fatal test warnings: absent TypeScript source map and jsdom full-document navigation unsupported. Initial unit failures were the four stale assertions described above; final rerun is green. Initial plain-HTTP visual launch hit Next middleware's loopback rewrite issue; the final harness uses the repository's local TLS server and a temporary trusted certificate.

## Visual evidence and limitations

See audit/Q3-visual-notes.md and ignored renders/Q3-visual.json.36 full-page and8 viewport screenshots cover NL/EN at1440/390: Quick Fix height-only/with-inseam; full height-only/OK/check/confirmed/large/override; handoff CTA and local session-storage values. Model values and dashed override are asserted, not merely photographed.

On390px, the complete height-only flow fits before the practical block: range bottom631.31px, optional inseam bottom718.31px, practical section starts742.31px within844px viewport (including example hint). Expanded optional measurement naturally adds content.

Full desktop layout compared with Main.dc.html: two input cards left, result/bar/sentence/single next step right, conditional dark refinement panel below. Parent inspected NL mobile Quick Fix and EN desktop measured result at full resolution. Main's support.js runtime is absent; comparison is against the supplied board source, not a claimed live canvas run.

Real local production page/header/footer/CSS used, not a component-only fixture. All external requests blocked. The two local Vercel analytics script paths are served empty JavaScript to avoid real telemetry;36 expected loopback:9 Convex CSP diagnostics are counted separately, not hidden as application successes. No hydration/application error is excluded. Actual Convex persistence/authentication is not exercised by browser QA; unit/contract handoff tests cover integration in memory.

Crawl JSON remains in ignored plans/seo-crawl-fixes/audit/crawl-q3-final.json and plans/migratie/audit/domain-migration-q3-final.json. Logs, screenshots and crawl JSON are confirmed git-ignored and excluded from files-Q3.txt.

## Handoff

Candidate ready for Lead review. No commits, deploys, production access, actual environment edits or mails. Temporary visual server/certificate cleaned up. Q3 source/tests/harness manifest: audit/files-Q3.txt; Q1/Q2 retain their separate manifests.
