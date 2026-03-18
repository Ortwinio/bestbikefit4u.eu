# Step 03 — Dashboard Language Switch QA

## Objective

Close the open browser QA gap from `feature-dashboard-language-switch` Step 04. Manually verify the language switch works correctly in all dashboard contexts.

## Background

Automated tests pass (typecheck, build, i18n tests). This step validates real browser behavior.

## QA Checklist

Test in both Chrome and Firefox. Test both EN→NL and NL→EN directions.

### Desktop (≥1024px)
- [ ] Language switch visible in dashboard sidebar
- [ ] Switching on `/en/dashboard` navigates to `/nl/dashboard`
- [ ] Switching on `/en/fit/[sessionId]/questionnaire` navigates to `/nl/fit/[sessionId]/questionnaire` (same sessionId preserved)
- [ ] Switching on `/en/fit/[sessionId]/results` navigates to `/nl/fit/[sessionId]/results`
- [ ] Switching on `/en/profile` navigates to `/nl/profile`
- [ ] Switching on `/en/bikes` navigates to `/nl/bikes`
- [ ] Switching on `/en/bikes/new` navigates to `/nl/bikes/new`
- [ ] Switching on `/en/bikes/[bikeId]/edit` navigates to `/nl/bikes/[bikeId]/edit`
- [ ] Query parameters (if any) are preserved after switch

### Mobile (≤767px)
- [ ] Language switch visible in mobile menu/nav
- [ ] All route switches from desktop checklist also work on mobile

### Copy verification (spot check)
- [ ] Dashboard home: navigation items translated in NL
- [ ] Questionnaire: action buttons (Next, Back) translated in NL
- [ ] Results page: back-navigation link translated in NL
- [ ] Bikes empty state: translated in NL
- [ ] No mixed-language chrome (e.g., NL page with EN sidebar)

### Locale persistence
- [ ] Reload on NL dashboard route stays on NL
- [ ] Log out and log back in: does locale cookie persist?

## Output

Document in `output-03-dashboard-language-switch-qa.md`:
- Checklist with pass/fail per item
- Screenshots or descriptions of any failures
- Browser + viewport where each failure was observed
