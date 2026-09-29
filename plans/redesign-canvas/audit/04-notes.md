# 04 — Cranklengte en zadelbreedte

Auteur: Codex B. Status: concepten gereed voor lead-QA; niet gepubliceerd.

## Opgeleverd

- `drafts/CrankLength.dc.html` — 1440 × 1240.
- `drafts/SaddleWidth.dc.html` — 1440 × 1300, inclusief de langere geschatte invoerstand.
- Alleen deze concepten en dit verslag geschreven. Geen applicatiecode, canvas-snapshot, planstatus of commits gewijzigd.

## Gedeelde ontwerpkeuzes

- Structuur, logo, header en schuifregelaars komen uit `plans/redesign-canvas/canvas/SaddleHeight.dc.html:1`. De navigatie is uitgebreid naar de acht gevraagde tabs; tabpadding en tussenruimte zijn verkleind zodat alles op één regel past. Alle links en knoppen hebben een klikhoogte van minimaal 44 px, inclusief de logolink.
- `Meer` verwijst naar `Main.dc.html`; de overige tabs verwijzen naar hun benoemde boardbestand. Beide bewaar-CTA's verwijzen naar `Login.dc.html`. Opslaan zelf is geen gesimuleerde backendactie.
- Bricolage Grotesque, Figtree, DM Mono en de merkpalette volgen `plans/redesign-canvas/reference/brand.md:30`. Alle rekenwaarden staan in DM Mono; de overgenomen merknaam blijft een logo.
- De invoerkolom is 540 px; de zijmarges zijn 64 px. Alleen SVG-geometrie voor de aangevraagde live tekeningen, geen externe illustratie of nieuwe asset nodig.
- Vooringevulde lichaamsmaten zijn zichtbaar als voorbeeldwaarden benoemd. Het openbare formulier start in de applicatie met lege maten; de voorbeelden zijn dus geen nieuwe engine-defaults (`src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx:89`, `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.tsx:48`).
- Alle rekenregels in `renderVals()` zijn voorzien van de gevraagde `// VOORLOPIGE REKENREGEL — echte engine: <file:line>`-annotaties. De bronverwijzingen bij SVG-coördinaten benoemen de bron van de gebruikte meetwaarde; de pixelschaal is uitsluitend illustratief en geen engine-geometrie.
- De scripts zijn tijdelijke lokale kopieën van de relevante engine-regels, zonder imports. Tijdens implementatie moeten de echte adapters/engines ze vervangen. De maatberekeningen zelf zijn gecontroleerd op gelijkheid met de huidige broncode; extra uitleg, schaalmarkeringen en illustraties zijn presentatiekeuzes.

## CrankLength

### Bronnen

| Onderdeel | Bron |
|---|---|
| Binnenbeenlengte 55–105 cm; live formulierstap 0,1 cm | `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.tsx:187` |
| Omrekening cm naar afgeronde mm | `src/lib/public-calculators/fitAdapters.ts:42`, `src/lib/public-calculators/fitAdapters.ts:98` |
| Race / Gravel / MTB / Stad | `convex/lib/fitAlgorithm/types.ts:6` |
| Discrete lengtes 165 / 170 / 172,5 / 175 / 177,5 mm; inclusieve grenswaarden 739 / 819 / 879 / 939 mm | `convex/lib/fitAlgorithm/constants.ts:157` |
| MTB: alleen verkorten als binnenbeenlengte ≥820 mm en de oorspronkelijke crank ≥175 mm | `convex/lib/fitAlgorithm/calculations.ts:65` |
| Huidige lengtekeuze, vergelijking en redactioneel advies | `plans/redesign-canvas/04-crank-saddle-width.md:7` |

### Bewuste keuzes

- **Afwijkende schuifstap: 0,5 cm**, expliciet gevraagd in stap 04; de audit/live pagina noemt 0,1 cm. Min/max en de engine-maattabel blijven ongewijzigd.
- Voorbeeld: 84 cm, Race. De huidige crank begint bewust onbekend; het uitklapbare blok laat één van de vijf discrete maten kiezen of de keuze wissen.
- De donkere schaaltegel is de aanbevolen maat. Een omlijnde tegel verschijnt alleen wanneer een aangrenzende, geldige schuifstap van 0,5 cm een andere aanbeveling geeft. Dat is een **meetgrens**, geen door de engine berekende tweede aanbeveling of tolerantie.
- Geen verzonnen ±-marge bij een vast onderdeel: de resultaatcopy benoemt dat een cranklengte een vaste maat is. Bij een grens wordt opnieuw meten voorgesteld.
- “Nu vs. advies” rekent **huidige lengte minus advies**. Een positieve waarde betekent dat de huidige crank langer is. Dit is een lokale vergelijking en geen bestaande crank-delta uit de volledige fit-engine.
- De live crankarm volgt de aanbevolen lengte; bij een huidige selectie komt er een petrol stippellijn bij. De maat is hart trapas tot hart pedaalas. De tekening is zichtbaar als schematisch benoemd.
- Het stappenblok laat eerst meten/controleren, daarna de noodzaak van een wissel beoordelen, en daarna de fit opnieuw controleren. Er wordt geen automatische onderdelenwissel beloofd.

## SaddleWidth

### Bronnen

| Onderdeel | Bron |
|---|---|
| Gemeten: zitbeenbreedte 60–200 mm, stap 1 | `src/lib/saddle-width-engine/config.ts:50`, `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx:312` |
| Geschat: lengte 140–220 cm, massa 40–150 kg, heupomtrek 70–160 cm | `convex/saddleWidth/mutations.ts:108` |
| Geschatte schuifstappen elk 1 | `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx:348`, `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx:358`, `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx:372` |
| Zeven rijtypes en drie houdingen; defaults endurance_road en balanced | `src/lib/saddle-width-engine/types.ts:1`, `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx:94` |
| Schatting zitbeenbreedte via heup-, lengte- en gewichtsklassen; schattingsinterval ±10 mm | `src/lib/saddle-width-engine/width-engine.ts:32` |
| Houding naar index, inclusief bijzondere regels voor agressieve TT en rechtop recreatief | `src/lib/saddle-width-engine/width-engine.ts:84` |
| Houdingstoeslagen en rijtypetoeslagen | `src/lib/saddle-width-engine/config.ts:3`, `src/lib/saddle-width-engine/config.ts:11` |
| Uitkomst en testvenster ±5 mm | `src/lib/saddle-width-engine/width-engine.ts:226` |
| XS 125–135, S 136–145, M 146–155, L 156–165, XL 166–175, XXL 176–190 mm | `src/lib/saddle-width-engine/config.ts:27` |
| Gemeten versus geschatte basisbetrouwbaarheid 95 versus 55; grenzen hoog/midden/lager | `src/lib/saddle-width-engine/config.ts:41`, `src/lib/saddle-width-engine/width-engine.ts:26` |

### Bewuste keuzes

- Voorbeelden: gemeten 125 mm; geschat 180 cm / 75 kg / 100 cm. Deze waarden zijn alleen demo-invoer, niet door de engine opgelegde defaults. De stand begint op Gemeten, Endurance en Gebalanceerd.
- Exacte bronberekening voor de publieke invoer zonder symptoomcorrecties. Gemeten voorbeeldresultaat: **147 mm**, testvenster **142–152 mm**. Geschat voorbeeld: zitbeenafstand **128 mm**, schattingsinterval **118–138 mm**; zadelstartbreedte **150 mm**, testvenster **145–155 mm**.
- Alle zeven rijtypes staan als Nederlandse optiekaarten met een korte beschrijving. De opdrachtspelling “Aggressief” is gebruikt; de interne enum blijft `aggressive`.
- Geschat toont direct “Lagere betrouwbaarheid”, het bredere zitbeenschattingsinterval en de oproep zelf te meten. Geen betrouwbaarheid die stijgt door klikken en geen ongefundeerd percentage op basis van voorbeelddata.
- Het zadelbovenaanzicht volgt de **onbegrensde berekende breedte**; de twee stippen volgen de gemeten/geschatte zitbeenafstand met dezelfde pixelschaal. De vorm is illustratief, geen saddle-family-aanbeveling.
- De engine begrenst de uiteindelijke breedte niet tot de klassen 125–190 mm (`src/lib/saddle-width-engine/width-engine.ts:226`). Daarom wordt buiten die schaal **geen uiterste tegel als passende maat ingekleurd**: er verschijnt een expliciete hermeetmelding. Dit wijkt bewust af van de fallback-labelselectie in `src/lib/saddle-width-engine/width-engine.ts:140`, maar verandert de berekende breedte en het testvenster niet.
- Binnen de schaal is de actieve klasse donker. Andere klassen krijgen alleen een rand wanneer ze het berekende testvenster raken. Klassen, grenzen en getoonde millimeters zijn niet vereenvoudigd.
- De meetgids met karton/folie is de gevraagde korte driestappeninstructie; er worden geen nieuwe nauwkeurigheidsclaims toegevoegd.

## Verificatie

- `node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/CrankLength.dc.html` — PASS, geen waarschuwingen.
- `node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/SaddleWidth.dc.html` — PASS, geen waarschuwingen.
- Crank: **404 combinaties** gecontroleerd tegen `calculateCrankLength` uit de echte TypeScript-bron: alle vier categorieën, alle schuifstappen van 55 tot en met 105 cm. Alle aanbevelingen gelijk; exact één actieve maat. Openen, huidige maat selecteren en wissen apart gecontroleerd.
- Zadel: **24.465 combinaties** gecontroleerd tegen `calculateSaddleWidth`: alle zeven rijtypes × drie houdingen, iedere gehele gemeten breedte 60–200 mm, plus geschatte klassen en grenswaarden voor heup/lengte/massa. Aanbeveling, testvenster en opgeloste zitbeenbreedte gelijk. Buiten-de-schaal-toestanden geven geen foutief actieve uiterste maat. Modus- en schuifhandlers apart gecontroleerd.
- Headless Chromium-preview voor crank standaard/uitgeklapt en zadel gemeten/geschat/buiten-schaal. Geen horizontale of verticale overflow in de uiteindelijke vijf toestanden; inhoud blijft binnen respectievelijk 1440 × 1240 en 1440 × 1300. Alle zichtbare klikdoelen minimaal 44 px.
- Screenshots van de resultaat-, vergelijkings-, geschatte en buiten-schaal-toestanden visueel beoordeeld. De preview lost DC-holes en conditionals lokaal op; dit is **geen native canvas-publicatiecheck**. De echte canvas-runtime en boardnavigatie blijven onderdeel van lead-QA/publicatie.
- Tijdelijke previews staan alleen onder `/tmp/04-*.png`; geen preview-harnas, dependencies of screenshots aan het project toegevoegd.

## Lead-handoff

Publiceer alleen na je eigen QA. De drafts bevatten geen appwijzigingen en geen wijzigingen aan `canvas/`. Eventuele gelijktijdige wijzigingen aan README, andere taken of `.claude/` zijn niet van deze uitvoering.
