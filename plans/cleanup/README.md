# Repo cleanup: remove old and unused files (owner, 4 Oct)

**C1 complete, uncommitted:** 1,767 historical files removed (55,288,872 bytes); 115 empty historical directories pruned. Required reader inputs, live policies/runbooks and output contracts retained; folder convention refreshed. Final C1–C3 combined gates all pass. Evidence: `C1-removed.md`, `C1-kept.md`, `C1-decisions.json`, `A-combined-gates.md`. No commits/deployments/production or environment changes/mails.

Branch `chore/repo-cleanup` in `/Users/ortwinverreck/Developer/bestbikefit4u-migratie` (from main @ 91a4e93).
git only as `git -C /Users/ortwinverreck/Developer/bestbikefit4u-migratie ...`, never in ~/Developer/bestbikefit4u.
No commits, deploys, prod data, env changes, mails. Everything removed stays in Git history.

**Rule for every deletion: prove it is unused.** Search the whole repo (incl. dynamic string paths, `public/` URLs
in code/CSS/MDX/JSON/CMS import data, `next.config.ts`, `package.json` scripts, `.github/workflows`, tests, Convex,
`scripts/`), and for `public/` files also check the production CMS-independent references (guide JSON in repo, email
templates, PDF renderer, OG/manifest). When in doubt: keep and list it. Write each decision to the audit file.

| ID | Owner | Scope |
|---|---|---|
| **C1 plans/** | A | Delete the historical plan folders in `plans/` (81 MB, ~1,900 files). **Keep**: `plans/README.md` (update it to describe the folder convention from CLAUDE.md), `plans/cleanup/`, `plans/migratie/` (live manual actions/runbooks), and anything a script/test/workflow still reads or writes (e.g. `scripts/seo-crawl-check.mjs` audit output dir, `scripts/riderprofile-baseline.mjs` — a baseline report runs on 18 Oct, guide import scripts, `tests/visual/*` fixtures). For each such dependency either keep the minimal needed files or move the output dir (e.g. to a git-ignored `artifacts/`), with tests. Also remove `BestBikeFit4U_Redesign_Plan.docx` and loose `*.md` plans. |
| **C2 public/ assets** | B | Remove unreferenced files in `public/`: e.g. the 11 `public/logo/bestbikefit4u_*` files, `BestBikeFit4U_ExampleReport_EN_v2.pdf`, unused images/illustrations/mascot/video variants. Keep `public/brand/**`, favicons/manifest/OG, `public/email/**`, `public/og/**` (guide OG images are referenced from the prod DB), anything referenced by the guide import JSON or emails. Run `scripts/check-image-weight` and the image tests. |
| **C3 code, scripts, docs** | C | Remove dead code: unused components/hooks/lib modules/i18n keys (use the TypeScript compiler / a reachability script, not guesses), one-off scripts in `scripts/` that nothing calls and that served finished releases (e.g. rebrand capture, rb2/sweep helpers, old import helpers), stale `tests/visual/*` batches whose pages no longer exist, outdated docs in `docs/` (Strava, Marktplaats, old domain), and `GEMINI.md`-style agent files if tracked. Keep `AGENTS.md`, `CLAUDE.md`, `README.md`, `SECURITY.md`, `PRODUCT.md` (update stale facts: name BikeFitBoost, domain bikefitboost.com, no Strava). |

Audit per task: `plans/cleanup/<id>-removed.md` (path → reason → evidence of no reference) and `<id>-kept.md` (kept with reason).
Gates on the combined tree: typecheck, lint, test:unit, test:contracts, Convex tsc, build, `scripts/seo-crawl-check.mjs --local`,
`scripts/domain-migration-check.mjs https://bikefitboost.com https://bestbikefit4u.eu --local`. A owns the combined final gates.
Print `DONE C1` / `DONE C2` / `DONE C3`.

## C2 status (4 Oct)

Complete: removed 16 verified-unused files (483,991 bytes): ten old logo variants, five starter SVGs,
and the historical root example PDF. Kept the legacy logo PNG still read by a visual harness,
all CMS/guide/email/PDF-dependent assets and the uncertain crank illustration. All 281 remaining
public files are byte-unchanged. Per-path decisions: `C2-removed.md`, `C2-kept.md` and their linked
parallel audits. Image-weight check, 52 focused Vitest tests and three image-asset Node tests pass.
A retains ownership of the combined final gates; no competing build, commit or deployment by B.

## C3 status (4 Oct)

Complete and source frozen: removed 13 compiler-verified unreachable source files, one finished
rebrand capture script, and two unreferenced February SEO snapshots (16 files total).
Refreshed retained brand/domain documentation and documented uncertain files as kept.
Per-path proof: C3-removed.md / C3-kept.md and linked detailed audits; repeatable source scan:
C3-reachability.mjs. Typecheck, 69 focused tests (14 files), audit script ESLint and scoped
Git whitespace check pass. A owns the combined final gates/build/crawl; no competing build
or commit/deployment/production/environment/mail action by C.
