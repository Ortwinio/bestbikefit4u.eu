# S6 illustration alt text — complete

## Image audit

Inspected the actual local WebP assets before writing descriptions:

| Asset | Observed content | Treatment |
| --- | --- | --- |
| `02-zadelhoogte-meten.webp` | Bike seat tube with a measuring scale between bottom bracket and saddle | Descriptive NL/EN alt in the methods hero and profile wizard steps 1–2; does not misdescribe it as a person measuring inseam. |
| `03-cockpit-afstellen.webp` | Drop handlebar, stem, Allen key and vertical adjustment arrow | Descriptive NL/EN alt in setup and locale-specific bike-fitting landing heroes. |
| `06-meetset.webp` | Book, tape measure, spirit level and pencil | Descriptive NL/EN alt in the calculation-engine hero. |
| `08-stack-en-reach.webp` | Frame with horizontal reach and vertical stack arrows referenced to bottom bracket/head tube | Descriptive NL/EN alt in the stack/reach hero. |
| `01-racefiets.webp` | Plain side-on bicycle drawing without explanatory measurements | Decorative on why-bikefit-matters; explicitly retains `alt=""`. |

## Implementation and scope

`EditorialHero` now requires an explicit `imageAlt` so callers intentionally choose descriptive text or the empty decorative alternative. All seven existing route callsites are covered. `ProfileWizardGuide` uses a localized account dictionary for its existing measurement illustration.

New text lives only in `src/i18n/marketing/editorialImageAlt.ts` and `src/i18n/account/profileWizardGuide.ts`. Frozen `messages/nl.ts` and `messages/en.ts` are unchanged. Visible copy, images, dimensions, layout classes, priority and responsive sizes are unchanged. No login attribution links, logos, calculator cards, dependencies, source assets or other-owner routes were edited.

FAQ/contact do not use EditorialLayout or ProfileWizardGuide and require no imageAlt changes from their owner. Parent was notified of that audit result.

## Validation

- 17/17 focused Vitest tests pass: editorial page rendering/metadata, profile wizard alt text, existing profile presentation controls and measurement wizard behavior.
- New checks verify rendered localized image alternatives across every hero route, preserve the decorative empty alternative and image dimensions/sizes, and verify wizard image visibility for steps 1–2 versus step 3.
- Scoped ESLint passes for all 13 touched source/dictionary/test files.
- Broader S6 gates remain parent-owned. No new screenshots were needed for this attribute-only change; images were visually inspected before implementation.

No commits, deployments, production access or network calls. DONE S6 alt-owned scope.
