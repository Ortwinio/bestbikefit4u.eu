# 07 — FTP W/kg en voeding/hydratatie

Codex A · 29 september 2026 · drafts voor lead-QA.

## Geleverde bestanden

- `drafts/FtpWkg.dc.html` — 1440 × 1240; drie testmethodes, dynamische vermogensschuif, gewicht, W/kg, referentieklim, vlakke snelheid en niveautabel-placeholder.
- `drafts/FuelHydration.dc.html` — 1440 × 1300; ritduur, intensiteit, temperatuur, zweetcontext, een interactieve tijdas en expliciete placeholders voor niet-onderbouwde inname-uitkomsten.

De hoofdtabbar gebruikt de bestaande structuur, met Meer actief; een tweede navigatierij verbindt FTP, vermogen/snelheid, klimplanner en voeding/drinken. Opslaan-CTA's verwijzen naar `Login.dc.html`; deze losse canvasboards slaan zelf niets op en dragen nog geen FTP over naar andere boards. Geen appcode of canvas-snapshot gewijzigd, geen commit.

## Voedingsbron: geen numerieke bandbreedtes gevonden

De volledige bronpagina `src/app/(public)/calculators/fuel-hydration/page.tsx` is gelezen, inclusief NL/EN-copy en de JSX. Er staan **geen numerieke hoeveelheden of bereiken** voor koolhydraten, vocht, natrium, bidoninhoud of inname-intervallen in. Getallen in CSS-klassen en layout zijn geen voedingsgegevens. Daarom is geen voedings- of hydratatieformule verzonnen en is geen bron buiten de opgedragen pagina toegevoegd.

| Onderdeel | Bron en betekenis | Uitwerking in de draft |
|---|---|---|
| Koolhydraten per uur | NL `page.tsx:137` noemt het onderwerp; `page.tsx:179` noemt een conservatieve range zonder cijfers; EN `page.tsx:42` en `page.tsx:84` idem. | `[G/UUR — bron nog kiezen]`; geen g/h-getal. |
| Koolhydraten totaal | De bron bevat geen uurinname waarmee een totaal kan worden berekend. | `[G TOTAAL — bron nog kiezen]`; geen afgeleid totaal uit een fictieve uurinname. |
| Vocht per uur | NL `page.tsx:197`–`198` noemt ml/uur en bandbreedtes maar geen waarden; EN `page.tsx:102`–`103` idem. | `[ML/UUR — bron nog kiezen]`; geen ml/h-getal. |
| Bidoninhoud en bevoorrading | NL `page.tsx:155` noemt flesvolume, bevoorrading en zweetverlies zonder inhoud; EN `page.tsx:60` idem. | `[BIDONINHOUD — bron nog kiezen]` en `[BIDONS — bron nog kiezen]`; geen aangenomen flesvolume of bidonaantal. De “bv. 500 ml” in contract 05 is geen goedgekeurde bronwaarde. |
| Innamefrequentie | NL `page.tsx:175`–`179` en de stappen bij `page.tsx:259`–`262` geven procesadvies, geen eet-/drinktijden. | `[INNAME-INTERVAL — bron nog kiezen]`, `[EETMOMENT]`, `[DRINKMOMENT]`. Markers zijn duidelijk schematische invulplekken, geen innameadvies. |
| Natrium/zout | NL `page.tsx:125` noemt natrium; `page.tsx:186` zegt het niet blind te verhogen; geen dosering. | Geen zoutdosering. De gevraagde honesty-kop komt letterlijk uit `07-ftp-fuel.md`; er is geen numeriek advies aan toegevoegd. |
| Invloed van omstandigheden | NL `page.tsx:149`, `page.tsx:161`, `page.tsx:177` beschrijven duur, intensiteit, warmte en individuele tolerantie zonder rekenfactoren. | Keuzes veranderen de samenvatting; zij vullen geen ontbrekende innamegetallen in. |

### Getallen die wél in de voedingsboard staan

| Getal | Herkomst / status |
|---|---|
| Ritduur 0,5–8 uur, stap 0,25 | `05-new-tool-contracts.md:40`, `[VOORSTEL]`. |
| Temperatuur 0–40 °C, stap 1 | `05-new-tool-contracts.md:40`, `[VOORSTEL]`. |
| Begininstelling 2 uur en 20 °C | Illustratieve invoerdefaults voor het canvas, geen voedingsadvies en geen claim uit de bronpagina; contract 05 specificeert geen defaults. Intensiteit Duur en zweet Gemiddeld zijn eveneens beginselecties. |
| Tijdas 0, halve duur, volledige duur | Rechtstreeks afgeleid van de gekozen ritduur; uitsluitend tijdsweergave. |
| Posities van twee placeholdermarkers | Ontwerpposities binnen de strook, uitdrukkelijk zonder aanbevolen tijd/frequentie/hoeveelheid; geen rekenregel voor inname. |
| Stapnummers 1–3 | Interfacevolgorde, geen nutritionele getallen. |

De exacte placeholders en hun reden blijven zichtbaar bij elke slider-/keuzestaat. Hiermee volgt de board de expliciete fallback van contract 05; een echt kwantitatief voedingsplan blijft afhankelijk van bronkeuze door de lead. Dit is geen stilzwijgend vervangen van de opdracht door algemene voedingskennis.

## FTP-contract en brongetrouwheid

| Onderdeel | Bron |
|---|---|
| Bekende FTP 80–500 W; testvermogen 100–550 W; laatste minuut 150–700 W; stap 5; factoren 1 / 0,95 / 0,75 | `05-new-tool-contracts.md:35`, `[VOORSTEL]`; bijbehorende code heeft `VOORSTEL-CONTRACT (05) — nog geen engine`. |
| Gewicht 40–150 kg, stap 0,5 | `05-new-tool-contracts.md:36`, `[VOORSTEL]`. |
| W/kg met twee decimalen | FTP gedeeld door lichaamsgewicht, contract `05-new-tool-contracts.md:37`. Fietsgewicht telt hier niet mee. |
| Referentieklim 5 km bij 7% | `05-new-tool-contracts.md:37`; expliciet een modelklim. |
| Racefiets 8,5 kg, CdA 0,32, asfalt-Crr 0,0045 | `src/lib/gearing-engine/config.ts:12`, `:23`, `:34`. |
| Aandrijfefficiëntie 0,97; luchtdichtheid 1,225; zwaartekracht 9,80665 | `src/lib/gearing-engine/config.ts:6`, `:8`, `:10`; luchtdichtheid zit ook als default in de gekopieerde functie. |
| Vermogen en snelheidsoplossing | `src/lib/gearing-engine/math.ts:175` en `:197`, exact de functies waar contract 05 naar verwijst. |
| Modelschaal tot 54 km/u | Bovenste solvergrens 15 m/s × 3,6; geen prestatieniveau of norm. |
| Voorbeeldstartwaarden 200 / 250 / 300 W en 75 kg | Canvasdefaults binnen de voorgestelde domeinen; geen gebruikersmeting of populatiegemiddelde. Per methode blijft de ingevoerde waarde behouden bij wisselen. |

### Controle: identieke gedeelde fysica

`calculateClimbPowerWatts` en `solveSpeedForPowerWatts` zijn rechtstreeks uit `math.ts` overgenomen, met uitsluitend verwijderde TypeScript-types/exports en gewijzigde inspringing. In de draft staan de voorgeschreven `ENGINE-FORMULE`-broncomments. De helper `clamp` heeft dezelfde implementatie als `math.ts:12`.

Een geautomatiseerde bronvergelijking heeft de getranspileerde bronfuncties vergeleken met de draftfuncties, na verwijderen van comments en witruimte: **identiek**. Daarmee blijven zwaartekracht-, rol- en luchtweerstandstermen, hellingsclamp, rendementsdeling, optionele defaults, bisectiegrenzen 0,1–15 m/s, maximaal 50 iteraties en stopcriterium onder 0,5 W ongewijzigd.

Daarnaast zijn **27 combinaties** gecontroleerd: drie methodes × minimaal/midden/maximaal testvermogen × 40/75/150 kg. W/kg, vlakke snelheid en klimtijd komen overeen met dezelfde bronfuncties. Klimtijd wordt afgeleid als 5000 / snelheid / 60; er wordt geen pacingfactor toegevoegd, want deze FTP-board rekent expliciet op FTP. Resultaten zijn afgeronde modelschattingen bij constant vermogen zonder wind; er is geen verzonnen foutmarge of niveau-indeling.

## Validatie

- `node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/{FtpWkg,FuelHydration}.dc.html`: beide PASS, zonder waarschuwingen.
- `node plans/redesign-canvas/check-runtime.mjs plans/redesign-canvas/drafts/{FtpWkg,FuelHydration}.dc.html`: FTP PASS in 28 toestanden; Fuel/Hydration PASS in 40 toestanden, zonder ongebonden handlers.
- Bronvergelijking gedeelde fysica en de 27 numerieke combinaties: PASS.
- Lokale Chromium-layoutcontrole op 1440 px: marginaal overflow in de onderste gridpadding gevonden; die padding teruggebracht van 48 naar 32 px. Hercontrole: beide boards zonder overflow, documentbreedte 1440 px. Root- en `$preview`-maten blijven de afgesproken 1440 × 1240 en 1440 × 1300.
- De layoutcontrole werkt met uitgewerkte templatewaarden en lokale fallbackfonts. Canvas-Play en definitieve Google Fonts-rendering blijven onderdeel van lead-QA. Geen screenshots of appbestanden gegenereerd.
