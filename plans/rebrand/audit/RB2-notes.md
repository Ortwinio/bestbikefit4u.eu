# RB2 follow-ups — integration audit

## Scope and safety

Authorized after the lead confirmed PR #14 merged and live. Worktree:
`/Users/ortwinverreck/Developer/bestbikefit4u-rebrand`, branch `feature/rb2-followups`, baseline `b16f970`.
Three disjoint workers cover RP6 saddle-height, the contact measurement-guide target, and N07/N14
pure email renderers. Parent owns review and final gates. Supplied canvas exports are reference inputs,
not agent-authored changes. No commits, deployments, production access, sending, scheduling, dependency
changes or environment-file changes are authorized or performed.

Local app validation explicitly uses `https://www.bikefitboost.com` as the configured public origin,
inert loopback Convex URLs, and disabled billing flags in process environment only. The baseline preview
uses existing build `UVZIndeVjtShDM0girzs9` on loopback TLS. Mail previews block external requests and
resolve shipped images from disk. Synthetic fixture values and Lisa are preview data only.

## Implementation and evidence

- RP6: scoped container-responsive result layout and indivisible mono value; no engine changes.
  Worker evidence: `RB2-rp6-notes.md`.
- Contact: minimum 44px dimensions on the actual measurement-guide anchor, retaining native focus,
  localized destination and unchanged mailto content. Worker evidence: `RB2-contact-notes.md`.
- N07/N14: renderer-only bilingual additions against `canvas/project/mail/N07Dag7.dc.html` and
  `N14Dag14.dc.html`. Configured `.com` origin replaces the board's `.eu`; required caller URLs do not
  implement a check-in handler. No integration with senders or crons. Worker evidence: `RB2-mail-notes.md`.

## Validation log

Initial typecheck and all lint stages passed. The first full unit run caught the new day-7 fixture's
three answer links sharing the `preview-only` marker used by a generic unsubscribe assertion (two
locale failures). It also hit three unrelated worker-start timeouts during local idle sleep. Neither
failure is waived; final reruns and exact counts will be recorded below. No tests or timeouts are
disabled to mask these failures.

A second unit attempt discovered the RP6 worker's temporary source copies beneath ignored renders.
That run was stopped, the worker moved its snapshots outside the repository and added guaranteed
cleanup, and the entire suite was rerun without changing test exclusions. The crawl CLI also rejected
uppercase `RB2` before execution; it was rerun with its required lowercase `rb2` label.

Final source gates (4 October 2026):

| Gate | Result |
| --- | --- |
| `npm run test:unit -- --maxWorkers=4` | 384 files pass, 1 skipped; 3,009 tests pass, 20 existing skips; 51.69s |
| `npm run test:contracts -- --maxWorkers=4` | 44 files / 478 tests pass |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, including 254 contrast checks, CSS tokens, images and zero brand findings |
| `npx tsc --noEmit -p convex/tsconfig.json` | PASS |
| `npm run build` | PASS; build `MSu-06zxmzd_K0DN0AmB8` |
| `git diff --check` | PASS |
| Local crawl (`--local --skip-build --label=rb2 --delay=0`) | PASS; 875 checks, zero findings |

Full gate logs are `/private/tmp/rb2-{unit,contracts,typecheck,lint,convex-tsc,build,crawl}-final.log`.
Tests ran with temporary process-scoped idle-sleep prevention. Existing Vite configuration/source-map
warnings and jsdom navigation diagnostics remain warnings, not waived failing tests.

## Browser and visual acceptance

- **12/12 sweep cases pass**, three routes × NL/EN × 1440/390: `/contact`, `/tools/saddle-height`,
  `/calculators/saddle-height`. Zero runtime, overflow, image, touch-target, language, brand or serious/
  critical axe findings. Evidence: `renders/RB2/sweep/report.json`, `run-context.json` and PNGs.
  Isolated production build `ZXPl6jjYh3t3YVMXnwu14` uses the final UI sources. Later changes are confined
  to the pure email gauge asset/template and audit helpers; no UI source changed after this capture.
- RP6: **20 before + 20 after cases**, including initial 745, inseam boundaries, empty and loading
  fixtures. All 16 nonloading after cases have one-line, contained mono values and separate mm units;
  no horizontal overflow. Desktop baseline reproduces split 74/5. Parent reviewed desktop before/after
  and the NL390 result crop; worker reviewed the full matrix. Evidence: `renders/RB2/rp6/`.
- Contact: **4/4 before and 4/4 after checks**. EN390 actual anchor changes from 282.05 × 22 to
  282.05 × 44px. Focus-visible outline, all four clickable corners, containment, neighbor separation,
  localized link and mailto destinations pass. Parent reviewed EN390 focus capture; worker reviewed
  all 16 full/focused before/after images. Evidence: `renders/RB2/contact/`.
- Emails: **13 templates / 26 bilingual HTML-text pairs / 52 screenshots**, including eight new
  N07/N14 captures at375/600. Parent reviewed both new four-image sheets; worker reviewed all13 sheets.
  Existing11 templates' **88 HTML/text/PNG files are byte-identical** to before. N14 now uses the exact
  board gauge paths rasterized as a scoped email PNG beside its text, not the initial bulb fallback.
  Evidence: `renders/RB2/mail-{before,after,review}/`; equality hashes and full limitations in mail notes.

The N14 blob bytes were not supplied: the existing house tyre/pump illustration is reused and exact
blob identity is not claimed. Shared email layout spacing, footer and fallback fonts are preserved.
The board's erroneous day0 accessible label is corrected to day14/completed. None of the preview
links were followed and no new sender imports either renderer.

The contact page's pre-existing mobile feedback-widget overlap is unchanged and remains outside RB2.

Crawl summary: `plans/seo-crawl-fixes/audit/crawl-rb2.md` (raw JSON remains local/ignored).
All RB2 acceptance checks are complete. Exact changed-file inventory: `files-RB2.txt`; supplied boards
and ignored renders are excluded. Ready for lead review without committing or deploying.

## Boundaries

Browser email previews establish local rendering, not delivery or compatibility with every email
client. Account fixtures exercise actual components with fake auth/data, not live persistence.
M12Evaluatie and unrelated B4 differences remain outside scope. Existing mail timing and eligibility
remain unchanged; N07/N14 require a separately authorized sender and link-handler integration.

The one-off evidence scripts RB2-rp6-browsercheck.mjs and scripts/rb2-email-evidence.mjs were kept out of the repository (local-only TLS/HTML handling); their results are recorded above.
