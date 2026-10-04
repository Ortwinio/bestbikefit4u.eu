# Betrouwbaarheidsrelease

**Status:** ontwerpfase afgerond op 5 oktober 2026. Er is nog geen code geschreven; de bouwprompts volgen na akkoord op het ontwerp.

Het volledige ontwerp staat in [`ontwerp.md`](ontwerp.md). Het klikbare ontwerp staat in het canvas "Bereikbalk zadelhoogte" (https://claude.ai/artifact/ULTWotDeHFBQjFWW2bwEDN).

## Doel

Bij elk advies in millimeters (of een andere eenheid) laten we zien hoe betrouwbaar het is: een **bereikbalk met het 95%-bereik**, het gebied waarin de juiste waarde naar verwachting in 19 van de 20 gevallen ligt. Betere gegevens maken de balk zichtbaar smaller. Zo begrijpt de gebruiker waarom meten, inloggen en de betaalde verdieping zijn advies verbeteren.

## Achtergrond

- De huidige PDF-balk ("Test range") is een vaste band van 0,86–0,91 × binnenbeen en zegt niets over betrouwbaarheid.
- "Advice confidence" in het rapport telt alleen ingevulde velden (`calculateConfidence`).
- De profielscore (`shared/profileScore`) kent al herkomst en kwaliteit per maat (gemeten, geschat, afgeleid, herhaald). Dit ontwerp vertaalt die kwaliteit naar millimeters.
- De controle van het binnenbeen bestaat nu in drie varianten met verschillende drempels.

## Scope

1. Rekenmodel voor het 95%-bereik, eerst volledig voor zadelhoogte (ontwerp §3–§6).
2. Publieke calculators maximaal twee stappen, nooit lenigheid of core; verfijning na inloggen (ontwerp §2, §7).
3. Eén gedeelde plausibiliteitscontrole voor het binnenbeen: melding bij 5–12%, advies opnieuw meten of fitter boven 12% (ontwerp §5).
4. Eén bereikbalk-onderdeel voor alle twaalf calculators, het dashboard en het PDF-rapport (ontwerp §8–§9).
5. Kniehoekcontrole in het betaalde account: fase 1 zelf meten op een foto en invullen (ontwerp §8).

## Buiten scope

- Fase 2 van de kniehoekcontrole: automatisch meten uit de foto.
- Gekalibreerde bereiken voor de elf calculators naast zadelhoogte; die starten met de eerste schattingen uit ontwerp §9 en worden later gekalibreerd.
- Wijzigingen aan prijzen of aan de indeling gratis/betaald buiten wat hier staat.

## Aanpak

1. Gedeelde rekenfunctie voor bereik, plausibiliteit en volgende stap in `shared/`, met tests op het rekenvoorbeeld (ontwerp §6).
2. Bereikbalk-component voor web en PDF (doorlopend en maatbalk, groot en compact).
3. Publieke zadelhoogte-calculator: lengte en binnenbeen, meldingen, blok "Verfijnen in je gratis account", overdracht bij registratie.
4. Account-calculator: herkomst uit het profiel naar σB, herhaald meten, uitklap "Hoe we op x mm komen".
5. Dashboard en PDF: balk bij A–D, kolom "95%-bereik", blok "Hoe nauwkeurig is dit advies?".
6. Overige calculators: dezelfde balk met de eerste schattingen; lenigheid en core uit de publieke bike-fit-calculator.
7. Betaald: kniehoekcontrole fase 1 met aanpassingsplan.

## Acceptatiecriteria

- Voor de voorbeeldrijder (190 cm, binnenbeen 89 cm) geeft de rekenfunctie ±49, ±23, ±18 en ±13 mm; het advies zelf verandert niet door het bereik.
- Publiek vraagt de zadelhoogte-calculator alleen lengte en binnenbeen; geen enkele publieke calculator vraagt lenigheid of core.
- Een binnenbeen dat 4,9% afwijkt geeft geen melding, 5,1% een controlemelding, 11,9% een controlemelding, 12,1% het advies opnieuw te meten; motor, publiek en account gebruiken dezelfde grenzen.
- Elke calculator, het dashboard en het PDF-rapport tonen hetzelfde bereikbalk-onderdeel, met ± in tekst en een toegankelijke beschrijving.
- Onder elke balk staat precies één volgende stap volgens de regels in ontwerp §5.
- Ingevulde publieke waarden gaan na registratie mee naar het profiel, met hun herkomst.
- De vaste testband 0,86–0,91 blijft alleen als interne veiligheidsgrens en wordt nergens meer als balk getoond.

## Open punt

- Fietstype in de publieke zadelhoogte-calculator: nu weggelaten (racefiets, met vermelding). Mogelijk als optionele derde vraag.

## Voortgang

- 5 oktober 2026: ontwerpfase vastgelegd (dit plan en `ontwerp.md`).
