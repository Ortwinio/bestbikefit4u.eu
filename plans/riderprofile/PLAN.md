# Verbeterplan: van publieke calculator naar compleet riderprofiel

Bron: Ortwin, 3 okt 2026. Productspecificatie; het design staat op het canvas onder "Riderprofiel-reis"
(boards in `boards/`, RP1–RP8 + RPSidebar). Bij verschil tussen tekst en board wint het board voor
vormgeving en deze tekst voor regels en data.

## Doel
Het riderprofiel wordt het hart van het product: elke calculator begint ermee, vult het aan en laat zien
hoe het advies daardoor betrouwbaarder wordt. Bouwt voort op wat er is (profiel, fietsen, calculatorStates,
calculateConfidence van de fit-engine, verouderingscheck); geen herbouw.

- **Publiek → account zonder verlies.** Publieke calculator laat zien wat een account extra oplevert voor déze
  uitkomst. Na registratie worden de ingevulde waarden, na bevestiging, de eerste profielgegevens.
- **Twee zichtbare scores.** Volledigheid (hoeveel weten we) en betrouwbaarheid (hoe zeker), voor rider én per fiets.
- **Elke login een klein stapje.** Max. 1–2 vragen, gekozen op wat het advies het meest verbetert, altijd over te slaan.
- **Calculators als keten.** Starten vanuit profiel, zeggen welke gegevens gebruikt zijn, vragen alleen wat ontbreekt,
  werken profiel bij, wijzen de volgende calculator aan.
- **Adviezen op één plek.** Alle uitkomsten gegroepeerd in het riderprofiel (en per fiets) met verbeteracties.

## Ontwerpprincipes (gelden voor elk scherm)
1. Verleiden met waarde, niet met druk: geen terugkerende pop-ups, geen aftellers, geen angst-teksten.
2. Publiek blijft volwaardig: publieke uitkomst nooit verbergen of verslechteren.
3. Nooit twee keer vragen: hergebruik wat de gebruiker al gaf.
4. Altijd zeggen wat we gebruikten: per waarde datum, herkomst en hoe te wijzigen.
5. Gemeten ≠ geschat ≠ berekend; een berekende waarde telt nooit als meting.
6. Elke vraag noemt welk advies erdoor verbetert; overslaan mag altijd.
7. Geen gevoelige data in analytics of e-mailtracking: alleen gebeurtenissen zonder waarden
   (`handoff_confirmed`, `prompt_answered`, `profile_level_up`).

## 1. Publieke calculators: "Maak dit advies persoonlijker" (board RP1)
Vast blok onder de uitkomst op elke publieke calculator; vervangt de kale `/login`-links.
Kop met concrete winst; 2–3 punten (bewaard, nauwkeuriger, volgende calculator); knop
"Bewaar mijn gegevens · gratis account"; "Je ingevulde waarden gaan mee; je hoeft niets opnieuw in te vullen.
Geen account? Je uitkomst hierboven blijft gewoon staan." Rechts: lijst van aangeraakte waarden met label
gemeten/geschat/fiets/opgegeven; bij ≥3: "N gegevens klaar om te bewaren".

| Calculator | Kop (wat het account toevoegt) | Gaat mee |
|---|---|---|
| Complete bike fit | Je reach is nu geschat uit je lengte. Met je arm- en torsolengte rekenen we hem uit. | lengte, binnenbeen, flexibiliteit, core, rijdoel, fietscategorie |
| Zadelhoogte | Vergelijk met de zadelhoogte van je eigen fiets en zie precies hoeveel millimeter je verstelt. | binnenbeen + meetmethode, huidige zadelhoogte, rijdoel |
| Framemaat | Check deze maat tegen de geometrie van echte fietsen uit onze database. | lengte, binnenbeen, fietscategorie |
| Cranklengte | Zie wat een andere crank betekent voor je zadelhoogte en versnellingen. | binnenbeen, huidige crank |
| Zadelbreedte | Bewaar je zitbotmeting, zodat elk zadeladvies er voortaan rekening mee houdt. | zitbotbreedte + methode, huidig zadel |
| Bandenspanning | Bewaar je banden en wielen; je spanning past zich aan als je gewicht verandert. | gewicht, bandbreedte, velg, ondergrond |
| Versnellingen / klim / vermogen / W/kg | Bewaar je FTP en gewicht één keer; elke klim- en versnellingsberekening gebruikt ze. | gewicht, FTP + methode, kransen, cassette |
| Voeding | Je voedingsplan op basis van je echte gewicht en vermogen. | gewicht, FTP, zweetprofiel |

Momenten: direct onder de uitkomst, eenmaal per bezoek. Tweede publieke calculator: "Je binnenbeen van de vorige
calculator is al ingevuld" (alleen browsersessie). Derde gebruik: "5 gegevens klaar om te bewaren".
Sessie verdwijnt bij sluiten (publiek slaat niets blijvend op).

## 2. Overdracht bij registratie (boards RP2, RP3)
- Publieke calculator bewaart invoer in `sessionStorage` onder `bbf.handoff`: per waarde veld, waarde, eenheid,
  calculator, meetmethode (gemeten/geschat zoals opgegeven) en tijdstip. **Alleen door de gebruiker aangeraakte
  velden**, nooit standaardwaarden van een schuifregelaar.
- Knop → `/login?src=<calculator>&handoff=1`. **Geen meetwaarden in de URL.**
- Na de eerste succesvolle inlog: bevestigingsscherm "Welkom — dit nemen we mee" (RP3). Daarna sleutel wissen,
  ook bij annuleren.
- Convex-mutatie `profiles.importHandoff`: valideert elke waarde met dezelfde grenzen als het profiel en schrijft met
  herkomst `public_handoff`.
- RP3 toont per gegeven: bewaren / aanpassen / weglaten; fietsgegevens → "maak fietsprofiel 'Mijn racefiets'" of later;
  uitkomst wordt herberekend met het profiel. Onder de lijst de nieuwe scores en de eerste vervolgvraag.
- Bestaand profiel met afwijkende waarde: niet overschrijven maar keuze tonen ("Je profiel zegt 85 cm, de calculator
  84 cm. Welke klopt?" met opties profiel / vandaag / opnieuw meten).
- Alles weigeren → profiel start leeg; account werkt gewoon.

## 3. Volledigheid en betrouwbaarheid (scores, 0–100)
Rider-gewichten: binnenbeen 20 · lichaamslengte 10 · torsolengte 8 · armlengte 8 · flexibiliteit 8 · gewicht 6 ·
rijdersvragen (ervaring, uren, ritlengte) 6 · klachten (ja/nee, gebied) 6 · schouderbreedte 5 · FTP 5 ·
zitbotbreedte 5 · core-stabiliteit 4 · rijdoel 3 · dijbeenlengte 3 · schoenmaat + cleatsysteem 3 = 100.

- Volledigheid = som gewichten van ingevulde gegevens.
- Betrouwbaarheid = Σ gewicht × kwaliteitsfactor × versheidsfactor.
- Kwaliteit: herhaald gemeten (3× binnen tolerantie) 1,0 · door fitter/video 0,95 · eenmaal gemeten 0,85 ·
  zelf ingeschat 0,6 · afgeleid uit andere maat 0,3. Onopgeloste plausibiliteitswaarschuwing: kwaliteit × 0,5.
- Versheid: gewicht en FTP > 6 mnd 0,8; flexibiliteit > 12 mnd 0,8; lichaamsmaten verouderen niet
  (behalve lengte onder 18 jaar).
- Niveaus: 0–39 Basis · 40–69 Goed op weg · 70–89 Sterk · 90–100 Compleet.
- Betrouwbaarheid per advies: alleen over de gegevens die dat advies gebruikt; `calculateConfidence` van de engine
  wordt uitgebreid met de kwaliteitsfactor.
- Uitlegpagina "Hoe berekenen we je profielscore?" (eigen rekenregels, geen gevalideerde norm).

Fiets-gewichten: afstelling 38 (zadelhoogte 10, terugstand 6, zadel–stuur-reach 6, -drop 6, stuurpen lengte+hoek 5,
stuurbreedte 3, spacers 2) · geometrie 22 (stack 8, reach 8, zitbuishoek 4, balhoofdhoek 2) · identiteit 15 (type 5,
merk/model/jaar 5, framemaat 5) · aandrijving 10 (crank 4, kransen+cassette 4, wielomtrek 2) · verstelruimte en doel 6
(max zadelpen/spacerstack 3, rijdoel fiets 3) · contactpunten 5 (zadelmodel+breedte 3, pedalen/cleats 2) · banden 4.
Fietskwaliteit: gemeten met meetpunt 1,0 · geometriedatabase 0,95 · afgelezen van onderdeel 0,9 · Strava/advertentie-import 0,7 · geschat 0,6.

## 4. Altijd zichtbare indicatoren (boards RPSidebar, RP4, RP5, RP6)
Twee ringen (volledigheid petrol, betrouwbaarheid lime), niveau in woorden, één regel "volgende stap".
Zijbalk/mobiele kop op elke accountpagina (klik → Mijn profiel); dashboard bovenaan groot met "+8 punten als je…";
Mijn profiel kop met uitsplitsing per groep (maten, flexibiliteit, rijstijl, prestatie, comfort);
elke account-calculator: betrouwbaarheid van dít advies. Stijging: korte ring-animatie + tekst, geen confetti.
Daling neutraal uitgelegd. `role="meter"` met tekstwaarde; kleur nooit enige drager. Bestaande dashboardscores blijven.

## 5. 1–2 aanvullende vragen per login (board RP4)
Dashboardkaart "Twee vragen, één minuut" (geen modal), max 2 vragen, max 1 kaart / 24 u.
Score per kandidaat: winst = gewicht × (1 − huidige kwaliteit); relevantie ×1,5 bij recent bekeken advies/gebruikte
calculator; keuze/één getal vóór meetlint, max één meetvraag; verouderde waarden als bevestiging ("Weeg je nog 74 kg?");
fietsvragen als er een fiets is. "Sla over" → 14 dagen verborgen; 3× overgeslagen → alleen nog in Mijn profiel.
"Niet nu" → kaart 7 dagen weg. Nooit gevoelige vragen (klachten/blessures). Boven 90 % alleen nog veroudering.
Na antwoord: ring loopt op + regel welk advies verandert.

## 6. Account-calculators als keten (board RP6)
Vijf stappen: (1) start vanuit profiel, live gelezen; (2) "We gebruiken je riderprofiel: …" met labels
gemeten/ingeschat/berekend; (3) vraag alleen wat ontbreekt, met de winst, rekent ook zonder met eerlijke bandbreedte;
(4) "We hebben je profiel en fiets bijgewerkt" + afwijking eerst als keuze (opslaan in profiel / alleen deze berekening);
(5) één volgende calculator met reden. Regel: advies ontbreekt/verouderd én invoer het meest compleet; open klacht → fitflow eerst.

| Calculator | Start met (profiel / fiets) | Vraagt aanvullend | Werkt bij | Volgende |
|---|---|---|---|---|
| Complete bike fit | maten, flex, core, klachten; geometrie + afstelling | torso/arm, huidige zadel- en stuurpositie | fietsafstelling, rijdoel fiets | zadelhoogte → ritfeedback |
| Zadelhoogte | binnenbeen, crank, flex, rijdoel; huidige zadelhoogte | meetpunt huidige hoogte, herhaalmeting binnenbeen | huidige zadelhoogte + datum | zadelbreedte als zitbot ontbreekt, anders bike fit |
| Framemaat | lengte, binnenbeen, torso, arm, rijdoel | type fiets, merk/model | gekozen maat of kandidaat | bike fit voor die fiets |
| Cranklengte | binnenbeen, dijbeen, flex; huidige crank | dijbeen | huidige crank (fiets) | zadelhoogte |
| Zadelbreedte | zitbot, lengte, gewicht, flex, houding | zitbotmeting, huidig zadel + tevredenheid | zitbot (rider), zadelmodel (fiets) | zadelhoogte |
| Bandenspanning | gewicht; banden, velg, fietsgewicht | ondergrond, bandbreedte | wielset + banden | versnellingen |
| Versnellingen | gewicht, FTP; kransen, cassette, crank, wiel | rijdoelen | versnelling (fiets) | klimplanner |
| Vermogen/snelheid, klim, W/kg | gewicht, FTP, fietsgewicht, houding | FTP-methode, doelrit | FTP + datum | versnellingen of voeding |
| Voeding/hydratatie | gewicht, FTP, rijdoel | zweetprofiel, temperatuur | zweetprofiel | dashboard |

## 7. Mijn adviezen (board RP7)
Tab in Mijn profiel, gegroepeerd: zitpositie · contactpunten · cockpit en reach · aandrijving · banden ·
prestatie en voeding · framemaat en aankoop. Per advies: waarde + bandbreedte, huidige stand en verschil, betrouwbaarheid
met reden, status (nieuw/uitgevoerd/verouderd/wacht op ritfeedback), datum; volgorde volgt `changeOrder` van de engine.
Onder elke groep 1–3 verbeteracties gesorteerd op winst. Verouderd rustig gemarkeerd + één knop "herbereken alles".

## 8. Fietsprofiel (board RP8)
Rider = lichaam, flex, klachten, gewicht, FTP, rijdersvragen, standaard rijdoel. Fiets = type, merk/model/maat,
geometrie, huidige afstelling (zadel, stuur, stuurpen, spacers), onderdelen, wielen/banden, verstelruimte, rijdoel per
fiets, adviezen + ritfeedback. Bestaande `bikeProfiles` blijven variaties. Fietskaart: ringen + "Afstelling 60 % · meet je
zadelterugstand". Prominente knop "Zoek je fiets op" (database-match vult geometrie). Ontbrekend: meetpunt en datum per
afstelwaarde, zadelmodel, spacers en verstelruimte.

## 9. Code en datamodel
| Onderdeel | Wijziging | Startpunt |
|---|---|---|
| Publieke calculators | `bbf.handoff` (alleen aangeraakte velden) + blok | `*CalculatorForm.tsx`, links naar /login |
| Inlog | `handoff=1` herkennen, na inlog naar bevestigingsscherm | `src/app/(auth)/login` |
| Profiel-mutatie | `profiles.importHandoff` met validatie en conflictkeuze | `convex/profiles/mutations.ts` |
| Herkomst | tabel `profileObservations` (veld, waarde, eenheid, soort, methode, bron, datum, status) | nieuw; `profiles` blijft actuele waarde |
| Fietsherkomst | per afstelwaarde `measuredAt` + `measurePoint` + `source` | `bikes.currentSetup`, `bikes.currentGeometry` |
| Nieuwe velden rider | `ftpWatts`, `ftpMethod`, `ftpMeasuredAt`, schoenmaat, cleatsysteem | `profiles` |
| Nieuwe velden fiets | zadelmodel, spacers, max zadelpen, rijdoel per fiets | `bikes` |
| Scores | `scoreRiderProfile()` en `scoreBike()` in `shared/` of `convex/lib`, gedeeld door UI en engine | `calculateConfidence` |
| Vragenkaart | tabel `profilePrompts` + query `nextPrompts` | `DashboardMessageSurface`, rijdersvragen |
| Calculators | live lezen uit profiel; afwijking = keuze; gebruikt-blok; volgende-calculatorblok | `useCalculatorAccountState`, `resolveCalculatorValues` |
| Fitsessie | snapshot van gebruikte observaties i.p.v. stille override | `profileWithCalculatorInputs` vervalt |
| Adviezen | query `listAdviceGroups` | recommendations, saddleWidthSessions, gearingSessions, pressureCalculations |
| Veroudering | uitkomst bewaart gebruikte observation-id's; algemene `isStale()` | `isPressureStale`, `riderProfileUpdatedAt` |
| Indicatoren | `ProfileStrengthRings` in zijbalk, dashboard, profiel, calculator | `DashboardSidebar`, `DashboardHomeProfileIndicators` |
| Teksten | NL + EN | bestaande i18n-structuur |

## 10. Fasering en acceptatie
| Fase | Item | Omvang | Acceptatie |
|---|---|---|---|
| 1 Overdracht | Blok "Maak dit advies persoonlijker" op alle publieke calculators | S | Eigen kop en lijst per calculator; NL+EN; eenmaal per uitkomst, geen pop-up; publieke uitkomst blijft zichtbaar |
| 1 Overdracht | Sessie-overdracht + bevestigingsscherm | M | Alleen aangeraakte velden; niets in URL of analytics; na bevestigen in profiel/fiets met herkomst `public_handoff`; conflictkeuze; sleutel gewist. E2E: publieke zadelhoogte → login → profiel bevat binnenbeen |
| 1 Overdracht | FTP en rijdoel naar het profiel | S | Velden bestaan; prestatie- en versnellingscalculators vullen FTP vooraf in en tonen datum |
| 2 Scores | `profileObservations` + migratie | M | Bestaande waarden gemigreerd met beste inschatting van soort; profiel toont methode en datum; afgeleid vervangt nooit gemeten |
| 2 Scores | `scoreRiderProfile` + `scoreBike` + uitlegpagina | M | Unit-tests op gewichten en factoren; zelfde score overal; uitlegpagina |
| 2 Scores | Ringen op vier vaste plekken | S | Elke accountpagina; `role="meter"` met tekst; mobiel en desktop; volgende-stap-regel klikbaar |
| 3 Keten | Calculators lezen live + "We gebruiken je profiel" | M | Nieuwe profielwaarde direct zichtbaar in zadelhoogte, framemaat, crank; afwijking geeft keuze; stille override weg; fitsessie bewaart snapshot |
| 3 Keten | Volgende-calculatorblok + "profiel bijgewerkt" | S | Na elke account-calculator één aanbeveling; lijst van gewijzigde gegevens |
| 3 Keten | Vragenkaart bij login | M | Max 2 vragen, 1 kaart / 24 u; overslaan 14 d; nooit gevoelig; directe score- en adviesupdate |
| 4 Adviezen & fiets | Tab "Mijn adviezen" | M | Alle uitkomsttabellen samengevoegd; per advies waarde, verschil, betrouwbaarheid, status, datum; max 3 acties per groep |
| 4 Adviezen & fiets | Fietsvolledigheid + ontbrekende fietsgegevens | M | Score per fiets op kaart en fietspagina; database-match vult geometrie; afstelwaarden met meetpunt en datum |
| 4 Adviezen & fiets | Algemene verouderingscheck | M | Wijziging van een gebruikte waarde markeert precies de afhankelijke adviezen; één knop herberekent |

## 11. Meten
Alle doelen zijn hypotheses; meet twee weken de huidige stand vóór fase 1 live gaat. Indicatoren: publieke uitkomst →
account; aandeel registraties met bevestigde overdracht; mediane volledigheid na 7/30 dagen; aandeel beantwoorde
login-vragen vs "niet nu"; aandeel gemeten vs geschat; calculators per actieve gebruiker; aandeel adviezen met
ritfeedback; terugkeer binnen 30 dagen. Per kwartaal: gaat hogere betrouwbaarheid samen met minder klachten?
Gebruikerstoets met 5 amateurs volgens `docs/USABILITY_TESTING_PLAYBOOK.md`.
