# E1 — bilingual email design system and templates

Worktree: /Users/ortwinverreck/Developer/bestbikefit4u-emails
Branch: feature/bilingual-emails. No original-worktree edits, commits, deployment, or mail delivery.

## Delivered

- Published templates/index.ts before implementation and notified B in messages/C-to-B-template-contract.md.
  Eleven typed render functions return subject, preheader, HTML and plain text.
  Senders supply resolved numbers, epoch dates, localized action URLs and preference URLs.
- One inline/table layout: 600 px card, 40 px desktop / 24 px mobile padding, hosted 2× logo, 4 px lime rule,
  hidden padded preheader, document language and light color-scheme metadata.
- Hero, measurement tiles and rows, benefit icons, numbered tips, mint tip/app block, wrapping app chips,
  sign-off, external footer and one petrol CTA with a rectangular Outlook VML fallback.
- NL/EN dictionaries contain the literal customer copy from SPEC §5. EN must satisfy the widened NL shape;
  tests check key and interpolation parity. All user text is escaped and action/footer links reject executable schemes.
- Intl numbers, UTC dates, compact euro prices; no first name uses Hoi,/Hi,. Missing range, bike, frame,
  confidence, measurements, geometry, notes and version are omitted without inventing values.
  Fit report notes remain a sender responsibility: localized engine notes or genuine user-authored text.
- Hosted PNG assets: 358×60 logo, five 48×48 stroke-2 icons, three optimized existing house illustrations.
  Source details and reproducible conversion live in scripts/email-assets/README.md and generate.mjs.
  Public image budget remains green; every new PNG is below 300 KB.
- Local preview script renders 22 HTML + text files and 44 full-page PNGs at 600/375 px using the specified
  Lisa Jansen/Canyon/754/731–774/49/98/100/−6°/172.5/420/XL/90 sample values.
  Assets are intercepted from this worktree; no remote requests or sending API are used.
  Renders and checks.json are ignored through renders/.gitignore.

## Verification

- Focused E1: 47 tests pass (templates, layout, copy/format, assets).
- Combined email and asset suite: 138 tests pass, including B's mocked sender integration.
- Full npm run typecheck passes after concurrent integration fixes.
- Full npm run lint: ESLint and runtime checks pass; currently blocked by E2's new preferences form
  missing registration in the tooltip coverage list. Routed to B; no E1 lint errors.
- Preview checks: all 44 views have zero horizontal overflow, missing images or flex/grid elements.
- Reviewed both NL/EN contact sheets and detailed desktop/mobile samples; refined summary stem tile,
  wrapping chips and desktop padding. Logo, illustrations, units, labels and CTA remain legible.
- git diff --check passes.

## Assumptions and limits

- SPEC describes the internal lead notification as Dutch and unchanged, but the old source was English.
  Followed the explicit NL-only requirement: Dutch equivalents for its subject/labels, same submitted fields,
  date formatted in Dutch. Its EN preview intentionally also has lang=nl and Dutch copy.
- Day 7/14 remain skipped: the app has no check-in/progress feature. The requested tyre PNG is supplied
  but not inserted into another mail where SPEC did not request it.
- The fixed €9 offer and Fit Pass/Pro names are kept literally; no billing copy harmonization.
- Chromium verifies the responsive HTML, not actual Gmail/Apple Mail/Outlook inboxes. Outlook VML and
  fallback fonts are present and tested structurally; no unsupported claim of real inbox validation.
- Source PNGs are in the file manifest because they are shipped assets. Preview PNGs are excluded.
