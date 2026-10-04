# RB2 — follow-up implementation plan

## Status and start gate

**Implemented and validated, 4 October 2026.** The lead explicitly confirmed PR #14 merged and live.
Baseline verified: `feature/rb2-followups`, `b16f970`. Three disjoint workers own RP6, contact and mail
renderers; the parent owns integration and final validation. No commits or sending are authorized.

Work exclusively in `/Users/ortwinverreck/Developer/bestbikefit4u-rebrand`. After authorization, verify the
lead-approved post-merge baseline and working-tree state before editing; do not reset, rebase or overwrite
concurrent work without coordination. No commits, pushes, deployments, environment changes, production
access or sent mail. Follow the rebrand README and applicable AGENTS.md instructions.

## Evidence and scope

Source: `audit/B4-canvas-gaps.md`. Its captures establish two UI deviations and missing mail renderers;
they do not establish their exact source-level causes or certify every state.

| Item | Audit evidence | Starting point after authorization |
| --- | --- | --- |
| RP6 saddle-height result | Desktop `745` wraps as `74` / `5` | `src/app/(dashboard)/tools/saddle-height/page.tsx`; trace the actual result component/styles |
| Contact measurement-guide link | EN390 clickable link is22px high | `src/app/(public)/contact/page.tsx`; inspect the actual anchor and containing layout |
| N07Dag7 / N14Dag14 | No matching renderers; both board files absent from supplied snapshot | Existing `convex/emails/templates` contract/layout and `scripts/render-email-previews.mjs` |

Only these three items are included. Do not implement `M12Evaluatie`, alter the existing `M07FitHerinnering`
schedule, restore Marktplaats, introduce pricing-v3/gift features or fix unrelated language heuristics.
Preserve BikeFitBoost branding, existing tokens/fonts, origin configuration and unchanged sender addresses.

## 1. RP6 — keep the result readable

1. Reproduce the audited account result with deterministic local data, including745, at1440px. Read the
   RP6 board and inspect computed grid/flex widths, text wrapping and the numeric value/unit elements.
2. Fix the actual local layout constraint. Keep the numeric value indivisible while allowing the surrounding
   card to respond; adjust allocation/alignment where needed rather than blindly adding a minimum width
   that creates mobile overflow. Retain mono number styling and the existing unit treatment.
3. Preserve calculator arithmetic, rounding, units, profile prefill, persistence and handoff behavior.745 is
   regression fixture data, never a hardcoded production result. Avoid a global typography change.
4. Add a focused rendering regression plus a browser geometry assertion that the numeric value occupies
   one line, fits its card and does not clip. Exercise supported boundary values and loading/empty states
   where available; confirm NL/EN at1440 and390 with before/after full-page and viewport evidence.

**Acceptance:**745 is not split; valid values/units remain readable in both layouts; calculations and
interactions are unchanged; no new horizontal overflow.

## 2. Contact — enlarge the actual link target

1. Reproduce the EN390 measurement-guide anchor and identify its existing localized destination.
2. Give the anchor itself a minimum44px touch target through scoped layout/padding, including sufficient
   width. Do not merely enlarge a non-clickable wrapper or use an overlapping invisible hit area.
3. Preserve its accessible name, href, keyboard focus and contact-page mailto behavior. Keep the page's
   visual hierarchy; do not invent a contact form or rewrite unrelated copy/metadata.
4. Assert the localized link destination and measure the actual anchor's bounding box after fonts/layout
   settle. Check focus visibility, neighboring target separation and NL/EN at390 and1440.

**Acceptance:**the EN390 link is at least44px high and wide, fully operable and unclipped; NL and desktop
remain usable without page overflow or changed navigation.

## 3. N07Dag7 and N14Dag14 — renderers and previews only

### Reference dependency

The B4 audit explicitly says both current-board references are absent from the supplied snapshot. After
the merge/start message, locate approved exports using the current canvas manifest and audit inventory.
If still unavailable, ask the lead for those two board exports; do not invent their content/layout or claim
canvas parity. This blocks only the mail implementation, not the two independently authorized UI fixes.

### Implementation

1. Read both supplied boards, their approved copy and existing email renderer/type/copy/preview conventions.
   Map each board to a distinct template identity and document its required render inputs. Do not infer
   scheduling or eligibility policy from the names “Dag7” and “Dag14”.
2. Implement pure renderers with subject, preheader, HTML and plain text in NL/EN, using the existing email
   layout and dictionary organization. Match approved board hierarchy/CTA content; omit review-only strips
   and synthetic identities. Keep brand assets, configured absolute origin and existing footer/preferences
   conventions. Use deterministic preview data, never production records, live unsubscribe tokens or
   fabricated testimonials, outcomes, medical claims or commercial promises.
3. Register only the pure template exports/types and local preview fixtures needed to render these mails.
   Do not wire senders, Resend actions, crons, schedulers, lifecycle selection/logging, DB/schema changes,
   webhooks or production template imports. Existing scheduled mail behavior must remain unchanged.
4. Add renderer tests for both locales: approved subject/preheader/body/CTA, HTML/text parity, correct links,
   escaping and missing optional data according to the agreed contract. Use the repo's existing test setup;
   no new dependencies. Ensure tests/previews never invoke a transport or schedule work.
5. Generate local HTML/text previews and inspect full-page375/600px renders: two templates ×two locales
   ×two widths =eight new images. Check logo/assets, wrapping, contrast, CTA/footer readability and clipping.
   Regenerate the existing preview catalogue to detect shared-layout regressions; verify the actual
   post-merge template count rather than assuming the audit's11-template baseline is unchanged.

**Acceptance:**both mails match their supplied boards with bilingual HTML/text and reviewed previews;
existing templates remain intact; no mail is sent and no automatic sending path is introduced.

## Execution and validation after the start gate

- UI reproduction/fixes and mail rendering can be delegated to disjoint workers once references are available;
  keep shared email registration/preview files with one owner. Parent owns final integration and review.
- Start with focused component/renderer tests and targeted browser assertions. Then run the applicable
  rebrand gates: typecheck, lint (including brand/token checks), unit and contract suites, production build,
  standalone Convex tsc and local-only crawl. No deployment or live mail/API validation.
- Keep raw renders under `plans/rebrand/renders/RB2/` (git-ignored). Record commands, exact results, board
  provenance, before/after images and any remaining limitation in `audit/RB2-notes.md`; write the exact
  changed-file inventory to `audit/files-RB2.txt` during implementation, not during this planning stage.
- Update audit statuses only after direct evidence verifies each fix. Do not silently mark other missing
  boards or untested states complete. Hand off for lead review without committing or deploying.

## Planning handoff

The original planning-only handoff is superseded by the explicit start authorization above. Final
implementation evidence is recorded in `audit/RB2-notes.md`, with exact files in `audit/files-RB2.txt`.
The three scoped fixes, full source gates, 875 local crawl checks, 12-case sweep, precise geometry
checks and 52 email previews pass. No commits, deployments, sending or scheduling were performed.
