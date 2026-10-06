# U2 content — Build3 read-only visual review

## Evidence and limits

- Build: `nrNDRX3KXTT0C7uLLdRUZ`; report generated `2026-10-06T10:20:50.814Z`.
- Evidence directory: `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3`.
- Report read, not modified: `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/report.json`.
- Visually inspected all 52 baseline screenshots: 13 content families × NL/EN × 390/1440. Also inspected both languages' desktop details-open screenshots for FAQ and bike-fitting.
- Compared the corresponding 13 board documents under `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project` with rules 2/14/15 in `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/usability-advies-v2.md` and `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/README.md`. No identically named mobile variants of these 13 boards exist under `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/m`.
- This is review evidence, NOT manual guard approval. No source, guard, screenshot, existing audit, or approval files were changed. No build or tests were run.
- Native-range selector issue acknowledged from `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/messages/B-build3-handoff-selector.md`. Calculator handoff failure is not attributed to these content pages. Pass3 remains development evidence.
- Static screenshots cannot establish keyboard operation, true hit-box size, complete server-HTML/schema retention, or actual account/payment functionality. Those claims are not approved here.

## Concrete findings

### 1. Safety guidance remains hidden on bike-fitting and FAQ — rule 2

Both bike-fitting languages hide the guidance about persistent pain/injury/asymmetry inside collapsed explanation/FAQ content. The expanded screenshots expose this text; the baseline screenshots do not show equivalent specific advice. NL also hides the “Eerlijke grenzen” and “Minder geschikt als enige stap” cards. The board's “Kies extra begeleiding” guidance should not be treated as ordinary optional explanation under rule 2.

Evidence:
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/bike-fitting-nl-1440.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/bike-fitting-nl-1440-details-open.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/bike-fitting-en-1440.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/bike-fitting-en-1440-details-open.png`
- Board: `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/BikeFittingLanding.dc.html`.

FAQ likewise keeps “Wat als ik nu al pijnklachten heb?” / “What if I have existing pain while riding?” closed. The expanded answer contains the specific persistent/severe-pain escalation guidance. The visible introductory “Honest about limits” sentence promises guidance but does not supply it.

- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/faq-nl-1440.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/faq-nl-1440-details-open.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/faq-en-1440-details-open.png`

The same closed state is visible at 390px. The redirected bike-setup cases inherit bike-fitting's issue.

### 2. FAQ presents unresolved appointment placeholders — rule 14

The expanded personal-bike-fit answer visibly contains `[DUUR AFSPRAAK]`, `[LOCATIE]`, and `[VOORWAARDEN AFSPRAAK — juridisch toetsen]`, including Dutch placeholder text inside the English answer. It also tells readers to book through the calendar after payment. This is not publication-ready factual copy; the screenshot does not establish that booking is shipped. The canvas already contains duration/location placeholders, so this is an unresolved canvas/product decision, not permission to invent replacements.

- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/faq-nl-1440-details-open.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/faq-en-1440-details-open.png`
- Source corroboration, read only: `/Users/ortwinverreck/Developer/bikefitboost-usability/src/i18n/marketing/faq.ts`.
- Board: `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/FAQ.dc.html`.

The displayed €21.50/€13.50/€9.50/€234.50/€209.50 amounts match the requested price set. Correct prices do not resolve placeholders or prove functionality.

### 3. NL bike-fitting still duplicates account CTAs

The hero displays “Maak account voor rapport”; the closing lime block displays “Maak account aan”. Both remain visible at 390px and 1440px. This contradicts the requested removal of redundant account CTAs, although the canvas contains a similar account-oriented route. EN does not have this particular duplicate pair. Redirected NL bike-setup reproduces it.

- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/bike-fitting-nl-390.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/bike-setup-nl-1440.png`

### 4. Closed Foot Length disclosure stretches into a blank desktop card

At 1440px, the closed “Voetlengte” / “Foot Length” disclosure occupies a tall white panel next to the “Use your measurements” CTA, while preceding closed measurement disclosures are short rows. The blank area visibly suggests missing content and weakens the collapsed presentation. Mobile rows do not show this defect.

- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/measurement-guide-nl-1440.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/measurement-guide-en-1440.png`
- Board: `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/MeasurementGuide.dc.html`.

### 5. Why-bikefit lacks the board's visible safety boundary

The default NL/EN screenshots show the symptom checklist and next-step cards, but not the board's “Een startpunt, geen diagnose” guidance or its instruction not to keep riding in a painful position. This is a concrete default-view difference from the board, not a claim that hidden/SEO text was deleted.

- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/why-bikefit-nl-390.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/why-bikefit-en-1440.png`
- Board: `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/WhyBikeFit.dc.html`.

### 6. English guide-index introduction reads as internal editorial instructions

The visible introduction says “Master discovery page that routes riders by discomfort; ride type; setup question; or performance need.” This describes the page to an editor rather than guiding a rider. The board uses direct reader-facing copy (“Begin bij je klacht, rijtype of afstelvraag”).

- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/guides-en-390.png`
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/Guides.dc.html`.

## Coverage and concrete observations

All rows below cover both locales and both requested widths. Screen counts are the report's measured initial page height divided by 844, corroborated for the two recently fixed pages by PNG dimensions. They are not counts for expanded content.

| Content family | NL390 screens | EN390 screens | Observed baseline |
|---|---:|---:|---|
| how-it-works | 6.283 | 6.395 | Preparation disclosure closed; three process cards and next-step/tool cards stay visible, as on the board. Four tool choices remain; these are navigation, not a related-guide count. |
| measurement-guide | 6.866 | 6.771 | Height/inseam instructions and preparation stay open; five optional measures and remeasurement closed. Desktop blank-panel defect above. |
| pain-index | 6.938 | 6.868 | Five symptom cards, disclaimer, escalation card, and next steps visible; usage explanation closed. |
| pain-detail | 4.693 | 4.727 | Symptom/adjustment explanations closed; escalation block remains open; closing next step visible. |
| why-bikefit | 5.198 | 5.028 | Main explanations closed; checklist and next steps open; board safety-boundary gap above. |
| bike-fitting | 4.793 | 4.768 | Two explanation disclosures and three FAQ rows closed; safety/CTA findings above. |
| bike-setup | 4.793 | 4.768 | Screenshots reproduce bike-fitting, consistent with the existing redirect; no independent BikeSetup board parity can be claimed. |
| guides | 3.353 | 3.315 | Library explanation/topic groups closed; explore and start-fit actions visible; EN editorial-copy issue above. |
| guide-detail | 4.744 | 4.410 | Two-sentence quick answer, safety text and saddle-calculator next step visible; body sections collapsed. |
| blog-article | 4.985 | 4.865 | Three body sections collapsed; TOC, one related article, one related guide, and calculator next step visible. Fixture only. |
| science-article | 3.705 | 3.538 | Methods explanation closed; three related links and next step visible. Only methods route pictured; not all science modes. |
| faq | 6.050 | 5.968 | Questions closed; three related links and two closing action groups visible; safety and placeholder issues above. |
| pressure-landing | 5.376 | 5.282 | Assumptions closed; pressure tables, tire/rim-limit warning and calculator next step open. |

Specific height evidence:
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/measurement-guide-nl-390.png`: 390×5795.
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/measurement-guide-en-390.png`: 390×5715.
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/pain-index-nl-390.png`: 390×5856.
- `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/pain-index-en-390.png`: 390×5797.

## Rule 15 and evidence caveats

The completed report has four records per content family and no automated rule-2/14/15 failures among these 52 records. This is the runner's result, not my manual approval. In particular, the hidden safety and placeholder findings show why automated detection alone is insufficient.

Baseline screenshots show readable disclosure labels and no obvious overlapping content text. The report records no undersized targets, contrast failures or horizontal overflow for these content records; actual 44px hit boxes and numeric contrast were not independently measured in this read-only screenshot review. Focus/keyboard states were not reviewed.

Cookie banners obscure parts of baseline screenshots (for example measurement preparation and guide-index disclosures); they do not cover the header in these captures. The details-open screenshots inspected for bike-fitting/FAQ are unobscured. Do not interpret covered text as absent HTML.

The blog screenshots are the offline `visual-article-1` fixture. They do not prove published CMS content, canonical/hreflang, production metadata, or production nonce behavior. The board itself uses placeholder article copy. No production claims are approved from this fixture.

The pressure screenshot is the per-bike weight-table route, while `/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/PressureLanding.dc.html` depicts a 75kg example with paired pressure advice. The visible safety/table collapse can be reviewed here; exact single-weight board parity cannot be inferred.

No fixes were applied. Source remains frozen. Guard manual checks remain unapproved.
