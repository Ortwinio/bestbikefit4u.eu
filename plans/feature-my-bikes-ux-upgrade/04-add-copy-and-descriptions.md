# 04 — Add Copy and Short Descriptions

## Goal

Add the wording needed to make the new setup and pressure cards understandable without opening the bike detail page.

## Tasks

1. Extend [`src/i18n/messages/en.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/en.ts) and [`src/i18n/messages/nl.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/nl.ts) with:
   - new card titles if needed
   - short descriptive labels for current setup
   - short descriptive labels for active wheelset / tyre setup / current pressure
   - fallback copy for missing setup or missing pressure data
2. Add brief summary sentences in the UI, for example:
   - current setup saved for this bike
   - active wheelset and tyre setup currently selected
   - latest advised pressure versus current recorded pressure
3. Keep copy short and scannable.

## Acceptance Criteria

- [ ] English and Dutch copy added
- [ ] Current setup card has meaningful descriptive text
- [ ] Current tyre pressure/setup card has meaningful descriptive text
- [ ] Empty states remain clear when no data exists
