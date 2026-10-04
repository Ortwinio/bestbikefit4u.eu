# RB2 mail — renderer-only implementation

Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-rebrand`; branch `feature/rb2-followups`;
verified starting HEAD `b16f970c4e374d3787367090036281b75ce33612`. Lead's explicit PR14 merge/start
authorization supersedes the planning-only gate. Scope is N07Dag7 and N14Dag14 only.
No commits, pushes, builds, servers, production access, environment changes, mail sending,
scheduling, new dependencies or edits to shared layout were performed. Other workers' files are untouched.

## Provenance and contract

Read actual supplied boards before implementation, alongside RB2-plan, rebrand README and B3/B4 audits:

| Board | SHA-256 | Pure export |
| --- | --- | --- |
| `plans/rebrand/canvas/project/mail/N07Dag7.dc.html` | `7eab24b0ae64bd1e3d2e275b6949174b62ea408feeea585fc5dd878bd3c65a4d` | `renderDay7CheckIn(data, locale)` |
| `plans/rebrand/canvas/project/mail/N14Dag14.dc.html` | `3c0aa6c2aa472d9ee25dbe52bfd6bf4d9f716d31e8ca881c0218c98ccd9db7db` | `renderDay14Evaluation(data, locale)` |

Both return `{ subject, preheader, html, text }`; locale is `nl | en`. Dutch subject, preheader,
body, choices and CTA follow the supplied boards; English is the corresponding translation in the
existing typed dictionary. The board inbox/timestamp strip is preview chrome and is omitted from mail.

- `Day7CheckInData`: optional `firstName`; required `actionUrl`, `unsubscribeUrl`, `preferencesUrl`,
  and `answerUrls: { better: string; same: string; worse: string }`.
- `Day14EvaluationData`: optional `firstName`; required `actionUrl`, `unsubscribeUrl`, `preferencesUrl`.
- Missing/blank name uses the established localized generic greeting. Lisa occurs only in synthetic fixtures.
- All URLs are explicit caller-resolved absolute HTTP(S) inputs, validated/escaped by existing `safeHref`.
  Renderers preserve supplied destinations rather than constructing handlers, tokens or selection state.
  They do not enforce locale routing; a future caller must resolve correct localized destinations.
- Preview action URLs retain the established `/{locale}/fit` destination. Day-7 answer examples append
  `?preview-only=day7&answer=better|same|worse`. These demonstrate distinct renderer inputs only:
  there is **no implemented prefill handler, saved answer, check-in workflow or verified destination behavior**.
  The board's prefill sentence describes the future caller contract, not a working preview feature.
  No links were followed. Preview unsubscribe token is the existing non-live `preview-only` value.
- Day names do not create eligibility, timing or scheduling policy. M07FitHerinnering and all sender,
  cron, lifecycle, schema, logging, actions and transport sources are unchanged. M12Evaluatie is untouched.

## Layout and assets

Shared layout supplies the current configured `BRAND.siteUrl`/`BRAND.host` from `shared/brand.ts`, default
`https://www.bikefitboost.com`. The board's `.eu` footer is intentionally replaced; unchanged sender
addresses are outside this renderer work. Existing header PNG remains 172 × 30.

Progress and answer blocks use presentation tables instead of board CSS grid/flex. Day 7 has six lime
completed cells, a dark current cell and seven future cells. Day 14 has fourteen lime completed cells.
The erroneous board `aria-label="Dag 0 van 14"` is intentionally corrected to
`Dag 14 van 14 · afgerond` / `Day 14 of 14 · completed`. A labelled image-role wrapper exposes the
progress meaning and hides decorative cells from assistive technology.

N14 reuses `public/email/tyre.png`, the existing house ink drawing of pump/wheel, generated from
`public/illustrations/04-bandenspanning.webp` by `scripts/email-assets/generate.mjs`.
It retains full composition at approximately 213 × 160 inside a mint panel. The tyre asset was not regenerated.
PNG SHA-256: `11c65a9337329e93b67f6535fdae196fa13b52dc7bbf34d7d125b0ce06dc3c35`.
WebP SHA-256: `9d3e80b1ae61989e8b10d78234bc98bf364aaf9754c816bc979ac8292e7ad7e5`.
This matches the board's tyre subject/house illustration treatment; original `/_blob/3a2b...` bytes were
not supplied, so exact asset equivalence cannot be certified. Source-board captures explicitly map that
blob to this local asset and are not independent proof of blob identity.

Intentional shared-layout differences: existing spacing, 30px headings, inset lime rule and established
service-footer wording remain, rather than changing all mails to the board's 28px heading/full-width rule.
The initial bulb/gauge difference is resolved at the parent's request. N14 now uses a scoped
presentation table with a decorative 22 × 22 `public/email/icon-gauge.png` beside the tip text,
12px separation and 16px mint-panel padding, matching the board hierarchy. The PNG uses the board's
exact paths `M4 16a8 8 0 1116 0` and `M12 16l4-5`, 24px viewBox, petrol 2px stroke and round
caps/joins. It is rasterized at 48 × 48 by the existing generator's new `--only=icon-gauge` option.
Only that PNG was generated; existing assets and shared layout are unchanged. Local capture blocks
remote Google Fonts, using the layout's fallbacks; strict font/pixel parity is not claimed.

## Validation and before/after evidence

Commands run from this worktree (no application server):

1. Before renderer edits: `node scripts/render-email-previews.mjs plans/rebrand/renders/RB2/mail-before`.
   Actual baseline catalogue: **11 templates**, 22 bilingual HTML/text pairs, 44 full-page images.
   The only preview-tool changes at that point were CLI output-path support and a computed summary count.
2. `npx vitest run convex/emails/templates convex/emails/i18n convex/emails/layout scripts/email-assets/assets.test.ts`:
   final gauge rerun **5 files / 62 tests passed**, 854ms. Initial run exposed two old broad unsubscribe
   assertions counting the three new preview answer URLs; selector now specifically matches
   `token=preview-only`. Added tests cover bilingual copy/progress, HTML/text and locale-link parity,
   explicit answer URLs, hostile names/attribute escaping, blank names, unsafe action/preference/answer
   URLs, and an esbuild import-graph allowlist excluding transport/lifecycle modules and I/O calls.
   Gauge regressions check its PNG dimensions/budget, decorative alt, 22px display size, presentation
   role and text in the adjacent table cell for both locales; N14 must not reference `icon-tip.png`.
3. `node scripts/render-email-previews.mjs plans/rebrand/renders/RB2/mail-after`:
   **13 templates**, 26 bilingual HTML/text pairs, **52 full-page images**, including the requested
   **2 new × 2 locales × 2 widths = 8 images**. All checks pass: no broken images, horizontal overflow
   or flex/grid layout. Raw results: `renders/RB2/mail-after/checks.json`.
4. `node scripts/rb2-email-evidence.mjs`: **88 existing files byte-identical**: 22 HTML + 22 text + 44 PNG.
   Before/after SHA-256 and equality per file: `renders/RB2/mail-review/existing-catalog-equality.json`.
   Generated 13 catalogue review sheets plus two explicitly asset-mapped source-board captures.
5. Focused ESLint on all nine changed source/test/tool files: passed (exit 0).
   `git diff --check`: passed. Full gates/build/crawl remain owned by parent.
6. Gauge follow-up: `node scripts/email-assets/generate.mjs --only=icon-gauge` generated only the
   requested asset. Focused ESLint for renderer, follow-up test, generator and asset test passed;
   `git diff --name-only -- public/email` was empty (all previously tracked email assets unchanged).
   Preview capture and evidence comparison were rerun after the gauge patch, preserving all 88 existing
   catalogue files byte-for-byte. All four corrected N14 full-size images were visually reviewed again.

The B3 capture path was reused; it fulfills allowed image paths directly from this worktree and aborts
all other requests. The evidence tool strips board scripts, maps only the two known blob paths to
local assets and aborts all other requests. Sheet images use inline data URLs. No network transport runs.
Browser launch/output directory writes required sandbox escalation because the harness initially
only allowed the original worktree, not the explicitly authorized rebrand worktree.

Every after-image was inspected via the thirteen `renders/RB2/mail-review/<kind>-sheet.png` contact
sheets (NL600/NL375/EN600/EN375), and both mapped board images were inspected. Logos, progress digits,
body, CTAs, artwork and footers are readable without overlap/clipping. N07 NL375 wraps “Minder goed”
onto two lines without truncation; the other choices remain single-line.

| Catalogue item | NL/EN × 375/600 review | Existing output equality |
| --- | --- | --- |
| loginCode | PASS | HTML/text/PNG identical |
| resultsSummary | PASS | HTML/text/PNG identical |
| fitReport | PASS | HTML/text/PNG identical |
| fitPassWelcome | PASS | HTML/text/PNG identical |
| caseStudyLead | PASS; intentionally Dutch for either input locale | HTML/text/PNG identical |
| caseStudyConfirmation | PASS | HTML/text/PNG identical |
| fitReminder | PASS | HTML/text/PNG identical |
| upgradeNudge | PASS | HTML/text/PNG identical |
| winback | PASS | HTML/text/PNG identical |
| proExplainer | PASS | HTML/text/PNG identical |
| day1Tips | PASS | HTML/text/PNG identical |
| day7CheckIn | PASS; pure preview links only | New |
| day14Evaluation | PASS; gauge matched, source-blob qualification above | New |

New individual captures: `renders/RB2/mail-after/day7CheckIn-{nl,en}-{375,600}.png` and
`renders/RB2/mail-after/day14Evaluation-{nl,en}-{375,600}.png`.
Before state for those two was missing renderers, not a fabricated broken-mail screenshot. Board
references are `renders/RB2/mail-review/{N07Dag7,N14Dag14}-source-local-assets.png`.

## Handoff

Exact scoped changed files are in `files-RB2-mail.txt`. Renders are git-ignored local evidence.
Parent owns final source/visual approval and full gates. Remaining limitations are the future link
workflow, original blob identity, fallback-font/browser-only previews
(not real Outlook/Gmail delivery tests), and parent approval. Existing 11 templates are unchanged.
