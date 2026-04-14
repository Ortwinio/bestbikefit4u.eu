# Prompt 03 — Ride Types Cluster Content

## Context

Read `plans/guide-content-enrichment/README.md`. Tasks 01 must be complete.

Read:
- `src/lib/guides/guide-content.ts` — add entries here
- `docs/bestbikefit4u_guides_cms_backlog_v1_en.csv` — slugs and briefs
- `src/app/(public)/guides/data.ts` — existing content for road, gravel, MTB, triathlon to migrate and expand

## Task

Write real EN + NL guide content for all Ride Types cluster guides.

### Guides to write

**`road-bike-fit-guide`**
- Focus: the endurance vs race setup tradeoff; saddle-first discipline; how bar drop relates to hip flexor length; realistic adaptation timelines
- Sections: "Saddle setup: the foundation of road fit", "Reach and cockpit: endurance vs race priorities", "Bar drop: matching flexibility to goal", "Adaptation: how long position changes take to feel right"
- FAQs: "What is the difference between an endurance and a race fit?", "Should I always ride in the drops?", "How do I know if my road position is sustainable?"

**`gravel-bike-fit-guide`**
- Focus: control and compliance over pure aero; wider bars and their effect on shoulder width; why gravel fit is closer to endurance road than MTB
- Sections: "Weight distribution on rough terrain", "Bar width and control", "Saddle and cockpit for mixed-surface comfort", "Tyre pressure and how it changes how your fit feels"
- FAQs: "Is a gravel fit just a more upright road fit?", "How wide should my gravel bars be?", "Why does my lower back hurt on gravel but not on the road?"

**`mountain-bike-fit-guide`**
- Focus: dynamic movement over static position; standing vs seated geometry; dropper post as a fit tool; reach for control vs efficiency
- Sections: "Standing position and attack stance", "Seated climbing: traction and efficiency", "Cockpit reach for trail control", "Dropper post: how it changes your fit needs"
- FAQs: "Is my MTB saddle height the same as my road saddle height?", "How does bar height affect my trail confidence?", "Why do my arms get tired on technical terrain?"

**`triathlon-bike-fit-guide`**
- Focus: aero as a constraint of sustainability, not just drag; hip angle and run preservation; pad width and stack as the key variables on a TT setup
- Sections: "Hip angle: the number that limits everything", "Aero extension setup: stack, reach, and pad width", "Saddle support on a TT bike", "Run preservation: what to check in transition pace"
- FAQs: "What hip angle should I target for a triathlon fit?", "How do I know if my aero position is hurting my run?", "Do I need a dedicated TT bike for a triathlon fit?"

**`endurance-bike-fit-guide`**
- Focus: durability over many hours, not just comfort; fatigue resistance as the goal; why endurance fit is not just "more upright" but specifically tuned for sustained output
- Sections: "What makes a fit truly endurance-appropriate", "Saddle and pelvic support for long rides", "Cockpit length and fatigue management", "Calibrating for your longest typical ride"
- FAQs: "What is the difference between an endurance fit and a comfort fit?", "Can I do long rides in an aggressive race position?", "How do I build toward a more aggressive position over time?"

**`indoor-trainer-bike-fit-guide`**
- Focus: why indoor riding magnifies saddle pressure; ventilation as a fit variable; no road vibration means less micro-movement, more static loading
- Sections: "Why your indoor position needs to be checked separately", "Saddle pressure and the static load problem", "Reach and head position on a fixed trainer", "Cooling, sweat, and their effect on hotspot development"
- FAQs: "Should my trainer setup match my outdoor setup exactly?", "Why do I get saddle sores indoors but not outdoors?", "Does fan placement affect how my fit feels?"

For every guide: provide equivalent NL content.

## Acceptance

- All 6 Ride Types leaf guides have entries in `GUIDE_CONTENT`
- Content is specific to each discipline — not generic cycling advice
- `npx tsc --noEmit` passes
