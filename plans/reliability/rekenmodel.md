
# Rekenmodel zadelhoogte en calculators: publiek, account, betaald

Oct 4, 2026 · @Ortwin

## Kern

De publieke zadelhoogte-calculator wordt twee stappen: lengte en binnenbeenlengte. Daarmee krijgt iedereen direct een advies met een 95%-bereik van ±49 mm, en na het binnenbeen ±23 mm. Alles wat het advies verder verfijnt (herhaald meten, fietstype, rijdoel, lenigheid, core) vraagt een gratis account; de kniehoekcontrole hoort bij betaald. Dezelfde opbouw en dezelfde balk gelden voor alle twaalf calculators (zie Betrouwbaarheid per calculator).

Het onderscheid komt uit de gegevens, niet uit een slechtere berekening: publiek en account gebruiken dezelfde formule. Lenigheid en core vragen we publiek bewust niet, omdat ze het advies maar enkele millimeters verschuiven, ruim binnen het publieke bereik, en omdat het zelfbeoordelingen zijn die we zonder profiel niet kunnen controleren.

Het ontwerp staat als klikbaar canvas in [Bereikbalk zadelhoogte](https://claude.ai/artifact/ULTWotDeHFBQjFWW2bwEDN). De achtergrond van de balk zelf staat in [Betrouwbaarheidsbalk: 95%-bereik bij elk advies](https://claude.ai/code/artifact/01ec8f8f-35e6-43b5-b4f8-0ea3d7c0f6a4).

## Drie niveaus

Elk niveau voegt gegevens toe; het bereik wordt smaller of het advies wordt persoonlijker, nooit allebei kunstmatig.

| Niveau | Wat we vragen | Bereik zadelhoogte | Wat er verder gebeurt |
| --- | --- | --- | --- |
| Publiek, stap 1 | Lengte | ±49 mm | Binnenbeen geschat als 0,47 × lengte |
| Publiek, stap 2 | Binnenbeenlengte, 1× gemeten | ±23 mm | Controle op afwijking t.o.v. lengte; niets wordt bewaard (alleen de sessie, voor overdracht bij registratie) |
| Gratis account | Binnenbeen 3× gemeten | ±18 mm | Maten bewaard in het profiel, met herkomst en datum |
| Gratis account | Fietstype, rijdoel, lenigheid, core-stabiliteit, klimmen, huidige zadelhoogte | Gelijk (verschuift het midden) | Advies past zich aan jouw rijden aan; vergelijking met je huidige afstelling |
| Betaald | Kniehoekcontrole (foto, zelf gemeten), geleide lenigheids- en core-test, aanpassingsplan | ±13 mm na kniehoek | Gemeten in plaats van geschat; stapsgewijs plan met evaluatie na ritten |

Veiligheidsinformatie (te hoog of te laag, wanneer naar een fitter) blijft op elk niveau zichtbaar.

## Rekenmodel 1: het advies

Het advies is het midden van de balk en gebruikt de bestaande formule van de rekenmotor. Op elk niveau is het dezelfde berekening; wat ontbreekt krijgt een neutrale waarde (0 mm).

```latex
ZH = B \times M_{\text{fiets}} + \Delta_{\text{lenig}} + \Delta_{\text{core}} + \Delta_{\text{doel}} + \Delta_{\text{klim}}
```

ZH = zadelhoogte in mm (midden trapas tot bovenkant zadel, langs de zitbuis). B = binnenbeenlengte in mm. Daarna wordt ZH afgekapt op 0,86–0,91 × B als veiligheidsgrens.

| Term | Waarden | Publiek | Account |
| --- | --- | --- | --- |
| B | Gemeten, of geschat als 0,47 × lengte | Ja | Ja (gemiddelde van metingen) |
| M fiets | Race 0,883 · gravel 0,880 · MTB 0,875 · stad 0,870 | Race (0,883) | Uit fietsprofiel |
| Δ lenigheid | −4,5 tot +4 mm (score 1–5) | 0 | Uit profiel |
| Δ core | −2,4 tot +2 mm (score 1–5) | 0 | Uit profiel |
| Δ rijdoel | Comfort −4 · gebalanceerd 0 · prestatie +3 · aero +6 mm | 0 | Uit profiel |
| Δ klimmen | 0 / +1 / +3 / +4 mm | 0 | Uit profiel |

Samen verschuiven de profieltermen het advies met hooguit −11 tot +16 mm, en een gemiddeld profiel (score 3, gebalanceerd, weinig klimmen) verschuift het 0 mm. Het fietstype scheelt voor een stadsfiets 12 mm; publiek melden we daarom “berekend voor een racefiets”.

## Rekenmodel 2: het 95%-bereik

Het bereik telt twee onzekerheden op: hoe goed we het binnenbeen kennen (σB) en hoe goed de formule bij dit lichaam past (σM). Profieltermen als lenigheid en core verschuiven het midden, maar maken het bereik niet smaller.

```latex
\text{halve breedte} = 1{,}96 \times \sqrt{(0{,}883 \times \sigma_B)^2 + \sigma_M^2}
```

```latex
\text{bereik} = \text{afronden}_5(ZH - \text{halve breedte}) \;\text{tot}\; \text{afronden}_5(ZH + \text{halve breedte})
```

De halve breedte tonen we op hele millimeters (“±23 mm”), de grenzen afgerond op 5 mm.

**Constanten**

| Constante | Waarde | Soort | Onderbouwing |
| --- | --- | --- | --- |
| σB, binnenbeen geschat uit lengte | 3,0% van B | Wetenschappelijke data | [ANSUR II](https://github.com/hkair/anthropometric-stats), 6.068 volwassenen: 2,9% (m) en 3,2% (v) |
| σB, zelf geschat (geen meting, geen lengte) | 3,0% van B | Eigen rekenregel | Niet beter dan een schatting uit lengte |
| σB, 1× zelf gemeten | 10 mm | Eigen rekenregel | Boek-tegen-de-muurmethode |
| σB, n× gemeten binnen 5 mm | 10 / √n mm (n max 3) | Afgeleid | Gemiddelde van onafhankelijke metingen |
| σB, gemeten door fitter of op video | 5 mm | Eigen rekenregel |  |
| σM, formule | 1,0% van ZH | Eigen rekenregel met praktijkreferentie | Kniehoekvenster 25–35° ≈ 21 mm zadelhoogte ([kniekinematica](https://www.jsc-journal.com/index.php/JSC/article/download/541/591)) |
| σM, na kniehoekcontrole binnen 25–35° | 4 mm | Eigen rekenregel |  |

**Herkomst in het account → σB.** Het profiel bewaart per maat al `kind`, `method`, `repeatCount` en `withinTolerance` (zie `shared/profileScore`). De eerste regel die past geldt, maar een open melding (regel 5) gaat altijd voor:

1. `kind = derived` of `estimated` / `declared` → 3,0% van B.
2. `kind = measured` en `method = fitter` of `video` → 5 mm.
3. `kind = measured`, `repeatCount ≥ 2` en `withinTolerance` → 10 / √`repeatCount` mm.
4. `kind = measured`, anders → 10 mm.
5. Open plausibiliteitsmelding (`unresolvedWarning`) → 3,0% van B, tot opnieuw gemeten.

Dit sluit aan op de kwaliteitsfactoren van de profielscore (0,3 / 0,6 / 0,85 / 0,95 / 1,0), zodat ring en balk hetzelfde verhaal vertellen.

## Controle en volgende stap

**Plausibiliteit binnenbeen.** Verwacht binnenbeen = 0,47 × lengte; afwijking = (gemeten − verwacht) / verwacht. Eén gedeelde controle voor publiek, account en rekenmotor vervangt de drie huidige varianten.

| Afwijking | Komt voor (ANSUR II) | Gedrag |
| --- | --- | --- |
| tot 5% | 91 van de 100 | Geen melding |
| 5–12% | 9 van de 100 | Rustige melding; na “Klopt, ga verder” normaal bereik |
| meer dan 12% | minder dan 1 op 1.000 | Advies opnieuw meten of erkende bikefitter; advies blijft op lengte gebaseerd. Na “Toch gebruiken”: binnenbeen gebruikt, bereik zoals bij stap 1, zone gestippeld |
| Binnenbeen ≥ lengte, of buiten 55–105 cm | — | Foutmelding, niet rekenen |

In het account geldt hetzelfde bij het opslaan van een maat; de melding wordt `unresolvedWarning` tot de gebruiker bevestigt of opnieuw meet. Bij meerdere metingen die meer dan 5 mm uit elkaar liggen tellen ze niet als herhaalde meting (`withinTolerance = false`).

**Volgende stap.** Onder de balk staat precies één stap: de eerste die past.

1. Melding meer dan 12% open → “Meet je binnenbeen opnieuw”.
2. Geen binnenbeen → “Vul je binnenbeenlengte in → ±23 mm”.
3. Publiek met binnenbeen → “Bewaar je maten en meet nog 2 keer → ±18 mm” (naar gratis account).
4. Account, minder dan 3 metingen → “Meet nog 2 keer → ±18 mm”.
5. Account, fietstype of rijdoel onbekend → “Kies je fiets en rijdoel; je advies past zich aan”.
6. Account, gratis, 3 metingen → “Controleer je kniehoek → ±13 mm” (betaalde verdieping, één keer per sessie getoond).
7. Anders → “Dit is het smalste bereik dat we online kunnen geven.”

Het getal achter de pijl wordt steeds berekend met dezelfde formule voor de situatie na die stap.

## Rekenvoorbeeld

De rijder uit het rapport van 3 oktober: lengte 190 cm, binnenbeen 89 cm, racefiets, lenigheid 2/5, core 3/5, rijdoel prestatie. Het advies komt uit op 787 mm, gelijk aan het huidige rapport; het bereik loopt van ±49 naar ±13 mm.

| Niveau | B (mm) | σB | Advies ZH | σM | Halve breedte | Getoond bereik |
| --- | --- | --- | --- | --- | --- | --- |
| Publiek, alleen lengte | 0,47 × 1900 = 893 | 3% = 26,8 mm | 893 × 0,883 = 789 | 7,9 mm | 1,96 × √(23,7² + 7,9²) = 49 | 740–840 |
| Publiek, binnenbeen 1× | 890 | 10 mm | 890 × 0,883 = 786 | 7,9 mm | 1,96 × √(8,8² + 7,9²) = 23 | 765–810 |
| Account, 3× gemeten + profiel | 890 | 5,8 mm | 785,9 − 1,5 (lenig) + 0 (core) + 3 (prestatie) = 787 | 7,9 mm | 1,96 × √(5,1² + 7,9²) = 18 | 770–805 |
| Betaald, plus kniehoek 31° | 890 | 5,8 mm | 787 | 4 mm | 1,96 × √(5,1² + 4²) = 13 | 775–800 |

Twee dingen vallen op. Het profiel verschuift het advies hier maar 1,5 mm, ver binnen het publieke bereik van ±23 mm. En de grootste winst zit in de eerste meting: die halveert het bereik.

## Waarom publiek zonder lenigheid en core

We laten lenigheid en core in de publieke calculator weg omdat ze het advies niet nauwkeuriger maken zolang het bereik nog ±23 mm of breder is. Zelfs de uiterste scores verschuiven de zadelhoogte samen maar −7 tot +6 mm.

De redenen op een rij:

- **Klein effect.** Lenigheid −4,5 tot +4 mm, core −2,4 tot +2 mm. Dat valt binnen het publieke bereik; het getal zou veranderen zonder dat het advies betrouwbaarder wordt.
- **Zelfbeoordeling.** Het zijn inschattingen op een schaal van 1 tot 5. In een account kunnen we ze bewaren, na een rit laten bijstellen en in de betaalde versie vervangen door een geleide test. Publiek kan dat niet.
- **Minder vragen, meer afmakers.** Twee vragen tot een bruikbaar getal is de kortste weg naar waarde; de rest komt als de gebruiker al iets heeft gekregen.
- **Eerlijk onderscheid.** Het publieke advies is niet slechter berekend. Het mist alleen gegevens die we pas zinvol kunnen gebruiken als het binnenbeen goed gemeten is.

Hetzelfde geldt voor rijdoel en fietstype: die verschuiven het advies (−4 tot +6 mm, stadsfiets tot −12 mm) en horen bij een fietsprofiel dat we pas in een account bewaren.

**Tekst op de publieke pagina** (inklapbaar, onder het resultaat):

> **Wat we hier nog niet meenemen** Dit advies gebruikt alleen je lengte en binnenbeen, berekend voor een racefiets. Fietstype, rijdoel, lenigheid en core-stabiliteit verschuiven je zadelhoogte meestal maar een paar millimeter, binnen het bereik hierboven. In een gratis account nemen we ze mee, bewaren we je maten en maak je het bereik smaller door nog twee keer te meten.

## Design per niveau

Alle schermen staan in [Bereikbalk zadelhoogte](https://claude.ai/artifact/ULTWotDeHFBQjFWW2bwEDN). De publieke calculator en de account-calculator zijn klikbaar en rekenen met de formules uit dit document.

**Publiek: twee stappen.** Links twee kaarten: lengte en binnenbeen. Rechts direct het resultaat met de bereikbalk.

- Na stap 1 staat er al een advies met ±49 mm en de stap “Vul je binnenbeenlengte in → ±23 mm”.
- Bij het binnenbeen krimpt de zone zichtbaar, met kort “Nauwkeuriger: ±49 → ±23 mm”.
- Een afwijking van 5–12% geeft een gele controlemelding, meer dan 12% een rode met “Opnieuw meten”, “Toch gebruiken” en “Vind een bikefitter”. Bij een open melding is de zone gestippeld.
- Daaronder het blok “Verfijnen in je gratis account” met precies drie regels: nog 2 keer meten (±18 mm), fiets/doel/lenigheid/core, maten bewaard. Plus de zin dat ingevulde waarden meegaan.
- Inklapbaar onder de invoer: “Wat we hier nog niet meenemen”.
- Weg uit de huidige publieke calculator: fietstype, rijdoel, lenigheid, core, de vaste “veilige startband” en de keuze gemeten/geschat (invullen is meten; geen binnenbeen is schatten).

**Gratis account: verfijnen.** Drie kaarten, gevuld vanuit het profiel.

1. Binnenbeen: metingen als chips met datum, knop “Meting 2 bewaren” tot drie metingen. Liggen ze meer dan 5 mm uit elkaar, dan vraagt de kaart om nog een meting.
2. Fiets en rijdoel: twee keuzerijen.
3. Lenigheid en core: met het label “Zelf ingeschat” en de zin dat ze het advies een paar millimeter verschuiven.

Rechts de balk met een uitklap “Hoe we op 787 mm komen” (binnenbeen × factor, lenigheid, core, rijdoel). Pas na drie goede metingen verschijnt één kaart “Verdieping: controleer je kniehoek, ±13 mm”; nooit eerder en nooit als pop-up.

**Betaald: kniehoek en plan.** Fase 1: de gebruiker maakt een foto van opzij in de onderste pedaalstand, meet zelf de hoek tussen het verlengde van het bovenbeen en het onderbeen (gradenboog-app of op een print) en vult die in. Een tekening en een stappenlijst laten precies zien wat je meet. Fase 2: we meten de hoek automatisch uit de foto. Uitkomst: hoek, oordeel t.o.v. 25–35°, de smallere balk en een aanpassingsplan in vier stappen met evaluatie na 7 dagen. Een waarschuwing bij pijn staat er altijd onder.

**Dashboard en PDF.** Zoals in het eerdere voorstel: compacte rij per advies met de bereikbalk, en in de PDF de kolom “95%-bereik” in plaats van de testband.

## Betrouwbaarheid per calculator

Elke calculator krijgt dezelfde balk en dezelfde opbouw: waarde met ±, de balk, “Gebaseerd op” en één volgende stap. Per calculator leggen we vast wat de grootste bron van onzekerheid is en welk niveau die verkleint. Zadelhoogte is uitgewerkt; voor de andere calculators zijn de breedtes een eerste schatting, te kalibreren zoals in de laatste sectie.

**Vaste regels voor elke balk**

- Publiek maximaal twee stappen, met lichaamsmaten en de fiets; nooit lenigheid of core.
- Schaal = advies ± 1,25 × het breedste bereik van die calculator, zodat smaller worden zichtbaar is.
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

De publieke bike-fit-calculator vraagt nu nog lenigheid en core; die gaan eruit. Fietstype blijft daar, omdat drop en reach er sterk van afhangen. Waar betaald “—” staat, voegt betaald voor die calculator geen nauwkeurigheid toe; de verdieping zit daar in vergelijken en plannen.

Alle twaalf staan met een voorbeeldwaarde op het canvas in [Bereikbalk zadelhoogte](https://claude.ai/artifact/ULTWotDeHFBQjFWW2bwEDN), onder “De bereikbalk bij alle calculators”. De balk is daar één onderdeel: een aanpassing aan de balk verandert hem bij elke calculator, het dashboard en het rapport tegelijk.

## Open punten en toetsing

Het ontwerp kan zo door naar bouw. Voor zadelhoogte zijn drie getallen eigen rekenregels; voor de andere elf calculators zijn alle breedtes nog een eerste schatting. Per calculator geldt dezelfde toets: komt de echte uitkomst in 93–97% van de gevallen binnen het bereik? Voor zadelhoogte toetsen we zo:

- **Meetfout 10 mm.** Toetsen met de herhaalmetingen die het account straks verzamelt.
- **Formulespreiding 1% (8 mm) en 4 mm na kniehoek.** Toetsen door na drie weken te vragen welke zadelhoogte de gebruiker heeft gehouden zonder klachten. Doel: 93–97% binnen het getoonde bereik.
- **Rekenregel 0,47 × lengte.** ANSUR II geeft 0,48 voor kruishoogte; een fietsbinnenbeen meet je anders. Kalibreren op gebruikers met lengte én gemeten binnenbeen.

Keuzes (de eerste staat nog open):

1. **Fietstype publiek:** nu weggelaten (racefiets, met vermelding). Een stadsfiets scheelt 12 mm; wil je het als optionele derde vraag houden?
2. **Kniehoekcontrole:** besloten. Betaald account; in fase 1 meet de gebruiker de hoek zelf op een foto, in fase 2 bouwen we de meting in. Toetsen of zelf meten ook ±13 mm haalt; zo niet, dan rekenen we in fase 1 met een iets ruimer bereik. (Een fittermeting telt als methode `fitter` en blijft mogelijk.)
