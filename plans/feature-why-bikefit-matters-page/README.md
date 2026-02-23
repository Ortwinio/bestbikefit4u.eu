# Why Bike Fit Matters Page Plan

## Goal
Add a "Read more quotes" link below the homepage quotes carousel that routes to a new content page at `/why-bikefit-matters`, including:
- the provided long-form draft content
- a visible top-20 quote section
- a bottom CTA section matching the homepage "Start your free bike fit today" pattern

## Scope
- Homepage quotes section (`read more quotes` link under carousel)
- New public content page route: `/why-bikefit-matters`
- SEO metadata for the new page (title + description provided)
- Bottom CTA block on the new page aligned with homepage CTA style/behavior

## Non-Goals
- Building a CMS for quote management
- Adding paid or gated content
- Rewriting global navigation IA beyond link insertion where needed
- Implementing additional locales unless explicitly requested

## Provided Inputs (Source of Truth)
- URL slug: `/why-bikefit-matters`
- Meta title: `Why a good bike fit matters (comfort, power, injury prevention)`
- Meta description:
  `Real rider outcomes after a proper bike fit: less pain, fewer numb hands, better control, more efficiency. Learn why millimeters matter and what a fit actually changes.`
- Full body copy and top-20 quotes: user-provided draft in task request

## Approach
1. Map and structure the provided draft into page sections with clear heading hierarchy.
2. Add homepage "Read more quotes" link under the existing carousel.
3. Implement the new page with the draft content and explicit top-20 quote list.
4. Add a bottom CTA block that matches homepage CTA behavior and conversion path.
5. Validate rendering, metadata, links, and quality checks.

## Acceptance Criteria
1. Homepage shows a "Read more quotes" link below the quotes carousel.
2. Link navigates to `/why-bikefit-matters`.
3. New page contains the supplied content and all 20 quotes.
4. New page has the requested meta title and meta description.
5. New page ends with a "Start your free bike fit today" CTA section consistent with homepage.
6. Lint/tests pass for modified files; no regression in homepage route behavior.

## Status
- Complete
- [x] Step 01: `01-content-architecture-and-copy-mapping.md` (`output-01-content-map.md`)
- [x] Step 02: `02-homepage-read-more-link.md` (`output-02-homepage-link.md`)
- [x] Step 03: `03-build-why-bikefit-matters-page.md` (`output-03-page-implementation.md`)
- [x] Step 04: `04-validate-and-polish.md` (`output-04-validation.md`)
