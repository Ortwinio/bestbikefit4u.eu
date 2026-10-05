
# Betrouwbaarheidsrelease — ontwerpfase

Rekenmodel en calculators: publiek, gratis account, betaald

Versie: 5 oktober 2026 · Status: ontwerp (nog geen code)

Bronnen in Claude:
- Ontwerpdocument: Rekenmodel zadelhoogte en calculators (claude.ai, Docs)
- Klikbaar ontwerp: canvas "Bereikbalk zadelhoogte" — https://claude.ai/artifact/ULTWotDeHFBQjFWW2bwEDN
- Achtergrond van de balk: "Betrouwbaarheidsbalk: 95%-bereik bij elk advies" — https://claude.ai/code/artifact/01ec8f8f-35e6-43b5-b4f8-0ea3d7c0f6a4

---

## 1. Kern

De publieke zadelhoogte-calculator wordt twee stappen: lengte en binnenbeenlengte. Daarmee krijgt iedereen direct een advies met een 95%-bereik van ±49 mm, en na het binnenbeen ±23 mm. Alles wat het advies verder verfijnt (herhaald meten, fietstype, rijdoel, lenigheid, core) vraagt een gratis account; de kniehoekcontrole hoort bij betaald. Dezelfde opbouw en dezelfde balk gelden voor alle twaalf calculators (zie hoofdstuk 9).

Het onderscheid komt uit de gegevens, niet uit een slechtere berekening: publiek en account gebruiken dezelfde formule. Lenigheid en core vragen we publiek bewust niet, omdat ze het advies maar enkele millimeters verschuiven, ruim binnen het publieke bereik, en omdat het zelfbeoordelingen zijn die we zonder profiel niet kunnen controleren.

Wat het 95%-bereik betekent (tekst voor de gebruiker):

> We berekenen je zadelhoogte uit je maten. Elke maat heeft een meetfout en elk lichaam reageert iets anders op dezelfde formule. Samen geeft dat een bereik waarin je ideale hoogte in 19 van de 20 gevallen ligt; betere metingen maken het smaller.

## 2. Drie niveaus

Elk niveau voegt gegevens toe; het bereik wordt smaller of het advies wordt persoonlijker, nooit allebei kunstmatig.

| Niveau | Wat we vragen | Bereik zadelhoogte | Wat er verder gebeurt |
| --- | --- | --- | --- |
| Publiek, stap 1 | Lengte | ±49 mm | Binnenbeen geschat als 0,47 × lengte |
| Publiek, stap 2 | Binnenbeenlengte, 1× gemeten | ±23 mm | Controle op afwijking t.o.v. lengte; niets wordt bewaard (alleen de sessie, voor overdracht bij registratie) |
| Gratis account | Binnenbeen 3× gemeten | ±18 mm | Maten bewaard in het profiel, met herkomst en datum |
| Gratis account | Fietstype, rijdoel, lenigheid, core-stabiliteit, klimmen, huidige zadelhoogte | Gelijk (verschuift het midden) | Advies past zich aan jouw rijden aan; vergelijking met je huidige afstelling |
| Betaald | Kniehoekcontrole (foto, zelf gemeten), geleide lenigheids- en core-test, aanpassingsplan | ±13 mm na kniehoek | Gemeten in plaats van geschat; stapsgewijs plan met evaluatie na ritten |

Veiligheidsinformatie (te hoog of te laag, wanneer naar een fitter) blijft op elk niveau zichtbaar.

## 3. Rekenmodel 1: het advies

Het advies is het midden van de balk en gebruikt de bestaande formule van de rekenmotor (`convex/lib/fitAlgorithm/calculations.ts`, `calculateSaddleHeight`). Op elk niveau is het dezelfde berekening; wat ontbreekt krijgt een neutrale waarde (0 mm).

```
ZH = B × M_fiets + Δ_lenig + Δ_core + Δ_doel + Δ_klim
```

ZH = zadelhoogte in mm (midden trapas tot bovenkant zadel, langs de zitbuis). B = binnenbeenlengte in mm. Daarna wordt ZH afgekapt op 0,86–0,91 × B als veiligheidsgrens (blijft intern, wordt niet als balk getoond).

| Term | Waarden | Publiek | Account |
| --- | --- | --- | --- |
| B | Gemeten, of geschat als 0,47 × lengte | Ja | Ja (gemiddelde van metingen) |
| M fiets | Race 0,883 · gravel 0,880 · MTB 0,875 · stad 0,870 | Race (0,883) | Uit fietsprofiel |
| Δ lenigheid | −4,5 tot +4 mm (score 1–5) | 0 | Uit profiel |
| Δ core | −2,4 tot +2 mm (score 1–5) | 0 | Uit profiel |
| Δ rijdoel | Comfort −4 · gebalanceerd 0 · prestatie +3 · aero +6 mm | 0 | Uit profiel |
| Δ klimmen | 0 / +1 / +3 / +4 mm | 0 | Uit profiel |

Samen verschuiven de profieltermen het advies met hooguit −11 tot +16 mm, en een gemiddeld profiel (score 3, gebalanceerd, weinig klimmen) verschuift het 0 mm. Het fietstype scheelt voor een stadsfiets 12 mm; publiek melden we daarom "berekend voor een racefiets".

## 4. Rekenmodel 2: het 95%-bereik

Het bereik telt twee onzekerheden op: hoe goed we het binnenbeen kennen (σB) en hoe goed de formule bij dit lichaam past (σM). Profieltermen als lenigheid en core verschuiven het midden, maar maken het bereik niet smaller.

```
halve breedte = 1,96 × √( (0,883 × σB)² + σM² )
bereik        = afronden_op_5(ZH − halve breedte)  tot  afronden_op_5(ZH + halve breedte)
```

De halve breedte tonen we op hele millimeters ("±23 mm"), de grenzen afgerond op 5 mm.

### Constanten

| Constante | Waarde | Soort | Onderbouwing |
| --- | --- | --- | --- |
| σB, binnenbeen geschat uit lengte | 3,0% van B | Wetenschappelijke data | ANSUR II (https://github.com/hkair/anthropometric-stats), 6.068 volwassenen: 2,9% (m) en 3,2% (v) |
| σB, zelf geschat (geen meting, geen lengte) | 3,0% van B | Eigen rekenregel | Niet beter dan een schatting uit lengte |
| σB, 1× zelf gemeten | 10 mm | Eigen rekenregel | Boek-tegen-de-muurmethode |
| σB, n× gemeten binnen 5 mm | 10 / √n mm (n max 3) | Afgeleid | Gemiddelde van onafhankelijke metingen |
| σB, gemeten door fitter of op video | 5 mm | Eigen rekenregel | |
| σM, formule | 1,0% van ZH | Eigen rekenregel met praktijkreferentie | Kniehoekvenster 25–35° ≈ 21 mm zadelhoogte (https://www.jsc-journal.com/index.php/JSC/article/download/541/591) |
| σM, na kniehoekcontrole binnen 25–35° | 4 mm | Eigen rekenregel | |

### Herkomst in het account → σB

Het profiel bewaart per maat al `kind`, `method`, `repeatCount` en `withinTolerance` (zie `shared/profileScore`). De eerste regel die past geldt, maar een open melding (regel 5) gaat altijd voor:

1. `kind = derived` of `estimated` / `declared` → 3,0% van B.
2. `kind = measured` en `method = fitter` of `video` → 5 mm.
3. `kind = measured`, `repeatCount ≥ 2` en `withinTolerance` → 10 / √`repeatCount` mm.
4. `kind = measured`, anders → 10 mm.
5. Open plausibiliteitsmelding (`unresolvedWarning`) → 3,0% van B, tot opnieuw gemeten.

Dit sluit aan op de kwaliteitsfactoren van de profielscore (0,3 / 0,6 / 0,85 / 0,95 / 1,0), zodat ring en balk hetzelfde verhaal vertellen.

## 5. Controle en volgende stap

### Plausibiliteit binnenbeen

Verwacht binnenbeen = 0,47 × lengte; afwijking = (gemeten − verwacht) / verwacht. Eén gedeelde controle voor publiek, account en rekenmotor vervangt de drie huidige varianten (`validation.ts`, `publicCalculatorLogic.ts`, `profileAutosave.ts`).

| Afwijking | Komt voor (ANSUR II) | Gedrag |
| --- | --- | --- |
| tot 5% | 91 van de 100 | Geen melding |
| 5–12% | 9 van de 100 | Rustige melding; na "Klopt, ga verder" normaal bereik |
| meer dan 12% | minder dan 1 op 1.000 | Advies opnieuw meten of erkende bikefitter; advies blijft op lengte gebaseerd. Na "Toch gebruiken": binnenbeen gebruikt, bereik zoals bij stap 1, zone gestippeld |
| Binnenbeen ≥ lengte, of buiten 55–105 cm | — | Foutmelding, niet rekenen |

In het account geldt hetzelfde bij het opslaan van een maat; de melding wordt `unresolvedWarning` tot de gebruiker bevestigt of opnieuw meet. Bij meerdere metingen die meer dan 5 mm uit elkaar liggen tellen ze niet als herhaalde meting (`withinTolerance = false`).

Teksten:

- 5–12%: "Je binnenbeen is wat langer [of: korter] dan gemiddeld bij jouw lengte. Dat kan prima kloppen. Controleer even of je in centimeters hebt gemeten en het boek stevig omhoog hield." Knoppen: Klopt, ga verder · Opnieuw meten.
- Meer dan 12%: "Deze binnenbeenlengte wijkt sterk af van wat we bij jouw lengte verwachten. Meet nog eens volgens de meetinstructie. Blijft de waarde zo, laat je dan meten door een erkende bikefitter." Knoppen: Opnieuw meten · Toch gebruiken · Vind een bikefitter.

### Volgende stap

Onder de balk staat precies één stap: de eerste die past.

1. Melding meer dan 12% open → "Meet je binnenbeen opnieuw".
2. Geen binnenbeen → "Vul je binnenbeenlengte in → ±23 mm".
3. Publiek met binnenbeen → "Bewaar je maten en meet nog 2 keer → ±18 mm" (naar gratis account).
4. Account, minder dan 3 metingen → "Meet nog 2 keer → ±18 mm".
5. Account, fietstype of rijdoel onbekend → "Kies je fiets en rijdoel; je advies past zich aan".
6. Account, gratis, 3 metingen → "Controleer je kniehoek → ±13 mm" (betaalde verdieping, één keer per sessie getoond).
7. Anders → "Dit is het smalste bereik dat we online kunnen geven."

Het getal achter de pijl wordt steeds berekend met dezelfde formule voor de situatie na die stap.

## 6. Rekenvoorbeeld

De rijder uit het rapport van 3 oktober: lengte 190 cm, binnenbeen 89 cm, racefiets, lenigheid 2/5, core 3/5, rijdoel prestatie. Het advies komt uit op 787 mm, gelijk aan het huidige rapport; het bereik loopt van ±49 naar ±13 mm.

| Niveau | B (mm) | σB | Advies ZH | σM | Halve breedte | Getoond bereik |
| --- | --- | --- | --- | --- | --- | --- |
| Publiek, alleen lengte | 0,47 × 1900 = 893 | 3% = 26,8 mm | 893 × 0,883 = 789 | 7,9 mm | 1,96 × √(23,7² + 7,9²) = 49 | 740–840 |
| Publiek, binnenbeen 1× | 890 | 10 mm | 890 × 0,883 = 786 | 7,9 mm | 1,96 × √(8,8² + 7,9²) = 23 | 765–810 |
| Account, 3× gemeten + profiel | 890 | 5,8 mm | 785,9 − 1,5 (lenig) + 0 (core) + 3 (prestatie) = 787 | 7,9 mm | 1,96 × √(5,1² + 7,9²) = 18 | 770–805 |
| Betaald, plus kniehoek 31° | 890 | 5,8 mm | 787 | 4 mm | 1,96 × √(5,1² + 4²) = 13 | 775–800 |

Het profiel verschuift het advies hier maar 1,5 mm, ver binnen het publieke bereik van ±23 mm. De grootste winst zit in de eerste meting: die halveert het bereik.

## 7. Waarom publiek zonder lenigheid en core

We laten lenigheid en core in de publieke calculator weg omdat ze het advies niet nauwkeuriger maken zolang het bereik nog ±23 mm of breder is. Zelfs de uiterste scores verschuiven de zadelhoogte samen maar −7 tot +6 mm.

- **Klein effect.** Lenigheid −4,5 tot +4 mm, core −2,4 tot +2 mm. Dat valt binnen het publieke bereik; het getal zou veranderen zonder dat het advies betrouwbaarder wordt.
- **Zelfbeoordeling.** Het zijn inschattingen op een schaal van 1 tot 5. In een account kunnen we ze bewaren, na een rit laten bijstellen en in de betaalde versie vervangen door een geleide test. Publiek kan dat niet.
- **Minder vragen, meer afmakers.** Twee vragen tot een bruikbaar getal is de kortste weg naar waarde; de rest komt als de gebruiker al iets heeft gekregen.
- **Eerlijk onderscheid.** Het publieke advies is niet slechter berekend. Het mist alleen gegevens die we pas zinvol kunnen gebruiken als het binnenbeen goed gemeten is.

Hetzelfde geldt voor rijdoel en fietstype: die verschuiven het advies (−4 tot +6 mm, stadsfiets tot −12 mm) en horen bij een fietsprofiel dat we pas in een account bewaren.

Tekst op de publieke pagina (inklapbaar, onder het resultaat):

> **Wat we hier nog niet meenemen**
> Dit advies gebruikt alleen je lengte en binnenbeen, berekend voor een racefiets. Fietstype, rijdoel, lenigheid en core-stabiliteit verschuiven je zadelhoogte meestal maar een paar millimeter, binnen het bereik hierboven. In een gratis account nemen we ze mee, bewaren we je maten en maak je het bereik smaller door nog twee keer te meten.

## 8. Design per niveau

Alle schermen staan in het canvas "Bereikbalk zadelhoogte". De publieke calculator, de account-calculator en de kniehoekcontrole zijn klikbaar en rekenen met de formules uit dit document.

### De bereikbalk (één onderdeel overal)

- Letter, titel en ondertitel links; balk in het midden; advies in DM Mono rechts met "± x mm" eronder.
- Lime zone met inktrand = 95%-bereik; inktstreep = advies; grenzen in DM Mono eronder, afgerond op 5 mm.
- Vaste schaal per calculator: advies ± 1,25 × het breedste bereik van die calculator, zodat smaller worden zichtbaar is.
- Gestippelde zone bij een open plausibiliteitsmelding.
- Versmallen animeert in 400 ms met kort "Nauwkeuriger: ±49 → ±23 mm" (geen animatie bij prefers-reduced-motion).
- Eén actieregel eronder, nooit een lijst. Geen percentage betrouwbaarheid per advies: de breedte in mm ís de betrouwbaarheid.
- Varianten: doorlopend (mm, km/u, min, W/kg, rpm, ml/u) en maatbalk (framemaat, cranklengte); groot (calculator) en compact (dashboard, PDF).
- Toegankelijk: `role="img"` met tekst als "Zadelhoogte 787 mm, bereik 765 tot 810 mm"; kleur is nooit de enige drager.

### Publiek: twee stappen

- Links twee kaarten: lengte en binnenbeen. Rechts direct het resultaat met de bereikbalk.
- Na stap 1 staat er al een advies met ±49 mm en de stap "Vul je binnenbeenlengte in → ±23 mm".
- Bij het binnenbeen krimpt de zone zichtbaar.
- Een afwijking van 5–12% geeft een gele controlemelding, meer dan 12% een rode met "Opnieuw meten", "Toch gebruiken" en "Vind een bikefitter".
- Daaronder het blok "Verfijnen in je gratis account" met drie regels: nog 2 keer meten (±18 mm), fiets/doel/lenigheid/core, maten bewaard. Plus de zin dat ingevulde waarden meegaan bij registratie.
- Inklapbaar onder de invoer: "Wat we hier nog niet meenemen".
- Weg uit de huidige publieke calculator: fietstype, rijdoel, lenigheid, core, de vaste "veilige startband" en de keuze gemeten/geschat (invullen is meten; geen binnenbeen is schatten).

### Gratis account: verfijnen

Drie kaarten, gevuld vanuit het profiel:

1. Binnenbeen: metingen als chips met datum, knop "Meting 2 bewaren" tot drie metingen. Liggen ze meer dan 5 mm uit elkaar, dan vraagt de kaart om nog een meting.
2. Fiets en rijdoel: twee keuzerijen.
3. Lenigheid en core: met het label "Zelf ingeschat" en de zin dat ze het advies een paar millimeter verschuiven.

Rechts de balk met een uitklap "Hoe we op 787 mm komen" (binnenbeen × factor, lenigheid, core, rijdoel). Pas na drie goede metingen verschijnt één kaart "Verdieping: controleer je kniehoek, ±13 mm"; nooit eerder en nooit als pop-up.

### Betaald: kniehoekcontrole en aanpassingsplan (besloten)

- **Fase 1 (eerste release):** de gebruiker maakt een foto van opzij in de onderste pedaalstand, meet zelf de hoek tussen het verlengde van het bovenbeen en het onderbeen (gradenboog-app of op een print) en vult die in. Een tekening en een stappenlijst laten precies zien wat je meet: trainer of iemand die de fiets vasthoudt, fietsschoenen, crank in het verlengde van de zitbuis, foto recht van opzij op heuphoogte, twee keer meten en het gemiddelde invullen.
- **Fase 2 (later):** we meten de hoek automatisch uit de foto. Op het scherm staat al "Binnenkort: wij meten de hoek uit je foto".
- Uitkomst: hoek, oordeel t.o.v. 25–35° (binnen het venster / te gestrekt: zadel waarschijnlijk te hoog / te gebogen: zadel waarschijnlijk te laag), de bereikbalk (±13 mm binnen het venster) en een aanpassingsplan: verstellen met maximaal 5 mm per stap (circa 2 mm per graad), twee rustige ritten, evaluatie per mail na 7 dagen, opnieuw meten of door naar het volgende onderdeel.
- Een waarschuwing bij pijn of tintelingen staat er altijd onder.

### Dashboard en PDF

- Dashboard: compacte rij per advies (A–D) met de bereikbalk, ± mm en "Gebaseerd op". Eén regel "Grootste winst" onder de lijst. De ringen Volledig/Betrouwbaar blijven bovenaan.
- PDF: kolom "Test range" wordt "95%-bereik" bij elk onderdeel; "Advice confidence 90%" wordt het blok "Hoe nauwkeurig is dit advies?" met de ± per onderdeel en wat het bereik smaller maakt. De vaste testband 0,86–0,91 × binnenbeen blijft de veiligheidsgrens van de berekening, maar wordt niet meer als balk getoond.

## 9. Betrouwbaarheid per calculator

Elke calculator krijgt dezelfde balk en dezelfde opbouw: waarde met ±, de balk, "Gebaseerd op" en één volgende stap. Zadelhoogte is uitgewerkt; voor de andere calculators zijn de breedtes een eerste schatting, te kalibreren zoals in hoofdstuk 10.

### Vaste regels voor elke balk

- Publiek maximaal twee stappen, met lichaamsmaten en de fiets; nooit lenigheid of core.
- Schaal = advies ± 1,25 × het breedste bereik van die calculator.
- Maten in stappen (framemaat, cranklengte) gebruiken de maatbalk: de zone ligt over de maten die passen.
- De balk toont altijd onzekerheid, nooit een aanbevolen band of veiligheidsgrens.
- Waar het advies een richtlijn is (koolhydraten per uur), toont de balk alleen de onzekerheid in jouw invoer, zoals vochtverlies.

| Calculator | Waarde | Grootste onzekerheid | Publiek (1–2 stappen) | Gratis account voegt toe | Betaald voegt toe | Breedte publiek → account → betaald |
| --- | --- | --- | --- | --- | --- | --- |
| Zadelhoogte | mm | Binnenbeen | Lengte; binnenbeen 1× | 3× meten; fiets, rijdoel, lenigheid, core | Kniehoek zelf gemeten op foto (later automatisch) | ±49 / ±23 → ±18 → ±13 mm |
| Zadelterugstand | mm | Dijbeen geschat uit lengte | Lengte, binnenbeen | Dijbeen en voet meten | Knie boven pedaalas op foto | ±15 → ±10 → ±6 mm |
| Stuurdrop | mm | Lenigheid onbekend | Lengte, binnenbeen (gemiddelde lenigheid aangenomen) | Lenigheid en core zelf ingeschat | Geleide lenigheids- en core-test | ±30 → ±20 → ±12 mm |
| Reach | mm | Torso en arm geschat | Lengte, binnenbeen | Torso en arm meten, fietsgeometrie | Houdingsfoto op de fiets | ±25 → ±15 → ±10 mm |
| Framemaat | maat | Geometrie van de fiets onbekend | Lengte, binnenbeen | Merk, model en maat (stack, reach) | Meerdere fietsen vergelijken | 2 maten → 1 maat → 1 maat met marge in mm |
| Cranklengte | mm (stap 2,5) | Binnenbeen, dijbeen | Binnenbeen, fietstype | Dijbeen, rijstijl | — | 3 lengtes → 1–2 lengtes |
| Zadelbreedte | mm | Zitbotbreedte | Lengte, gewicht en heup, of zitbotten meten met karton | Rijhouding | — | ±15 (geschat) / ±5 (gemeten) → ±5 mm |
| Vermogen en snelheid | km/u | Luchtweerstand (CdA) | Vermogen of snelheid, fietstype | Eigen fiets, houding, gewicht | Veldtest luchtweerstand | ±2,0 → ±1,2 → ±0,6 km/u |
| Klimplanner | min | FTP en gewicht | Klim, FTP-schatting | Gemeten FTP en gewicht uit profiel | Geleide FTP-test | ±10% → ±5% → ±3% van de tijd |
| FTP en W/kg | W/kg | Testmethode | Testvermogen, methode, gewicht | Gewicht gewogen en recent | Geleide test met protocol | ±6% (20 min) of ±10% (ramp) → ±4% → ±3% |
| Verzet | rpm op steilste klim | Vermogen | Verzet, klim | FTP en gewicht uit profiel | — | ±8 → ±4 rpm |
| Voeding en vocht | ml/u | Zweetverlies | Duur, temperatuur, inspanning | Zweettest: wegen voor en na een rit | — | ±50% → ±15% |

De publieke bike-fit-calculator vraagt nu nog lenigheid en core; die gaan eruit. Fietstype blijft daar, omdat drop en reach er sterk van afhangen. Waar betaald "—" staat, voegt betaald voor die calculator geen nauwkeurigheid toe; de verdieping zit daar in vergelijken en plannen.

## 10. Open punten en toetsing

Voor zadelhoogte zijn drie getallen eigen rekenregels; voor de andere elf calculators zijn alle breedtes nog een eerste schatting. Per calculator geldt dezelfde toets: komt de echte uitkomst in 93–97% van de gevallen binnen het bereik? Voor zadelhoogte toetsen we zo:

- **Meetfout 10 mm.** Toetsen met de herhaalmetingen die het account straks verzamelt.
- **Formulespreiding 1% (8 mm) en 4 mm na kniehoek.** Toetsen door na drie weken te vragen welke zadelhoogte de gebruiker heeft gehouden zonder klachten. Doel: 93–97% binnen het getoonde bereik.
- **Rekenregel 0,47 × lengte.** ANSUR II geeft 0,48 voor kruishoogte; een fietsbinnenbeen meet je anders. Kalibreren op gebruikers met lengte én gemeten binnenbeen.
- **Kniehoek zelf meten (fase 1).** Toetsen of zelf meten op een foto ook ±13 mm haalt; zo niet, dan rekenen we in fase 1 met een iets ruimer bereik tot de automatische meting er is. Een fittermeting telt als methode `fitter` en blijft mogelijk.

Besluiten:

1. **Fietstype publiek:** open. Nu weggelaten (racefiets, met vermelding). Een stadsfiets scheelt 12 mm; mogelijk als optionele derde vraag.
2. **Kniehoekcontrole:** besloten. Betaald account; fase 1 zelf meten op een foto, fase 2 ingebouwde meting.
