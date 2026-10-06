# Usability-advies BikeFitBoost

Oct 6, 2026 · @Ortwin

## Samenvatting

De calculators zelf werken goed, maar de reden om een account te maken komt te laat, is steeds dezelfde en het betaalde plan is op de meeste calculators onzichtbaar. Op mobiel staat de eerste accountknop 3,5 tot 6 schermen onder de bovenkant van de pagina, onder 650 tot 1.000 woorden uitleg.

Drie knelpunten:

1. **De reden komt te laat.** “Bewaar en verfijn gratis” staat pas na het resultaat en na blokken als “Wat dit niet vertelt”. Wie zijn uitkomst heeft, vertrekt meestal voordat hij daar is.
2. **Elke pagina is een losse calculator.** Waarden gaan al mee naar de volgende calculator, maar de site wijst niet de logische volgende stap aan. De homepage toont 8 van de 11 calculators.
3. **Te veel tekst bovenin het zicht.** Een calculatorpagina is op mobiel 11 tot 15 schermen lang. Alleen de veelgestelde vragen zijn ingeklapt; uitleg, rekenvoorbeeld en “waarom dit werkt” staan open.

De aanbeveling: zet direct onder elk resultaat één korte, per calculator verschillende reden voor een gratis account, gekoppeld aan wat de gebruiker net heeft ingevuld. Laat daaronder de volgende calculator zien met zijn waarden al ingevuld. Klap alle uitleg in onder één regel “Hoe rekenen we dit?” en laat het betaalde plan pas zien op het moment dat de gebruiker iets wil dat alleen betaald kan (tweede fiets, volledig stappenplan, vergelijken).

## Bevindingen usability-test

Getest op 5 en 6 oktober 2026: de live site (tekst van homepage, prijspagina en 8 calculators) en de nieuwste code lokaal op 1440 en 390 px breed, met een meetscript voor tekst en knopposities. Taak: “vind je zadelhoogte, check daarna je framemaat en kijk of een account zin heeft”. Eigen inspectie, geen test met echte fietsers; de aantallen hieronder komen uit de lokale versie en kunnen een paar procent afwijken van live.

| Calculator (mobiel) | Woorden | Schermen lang | Eerste accountknop na | Link naar prijzen |
| --- | --- | --- | --- | --- |
| Bike fit | 853 | 13,2 | 5,2 schermen | Nee |
| Zadelhoogte | 903 | 13,5 | 5,4 schermen | Ja |
| Framemaat | 698 | 11,8 | 4,1 schermen | Ja |
| Bandenspanning | 660 | 11,1 | 4,6 schermen | Nee |
| Verzet | 815 | 14,2 | 6,1 schermen | Ja |
| Klimplanner | 760 | 13,0 | 3,4 schermen | Nee |
| Voeding en vocht | 999 | 14,6 | 4,7 schermen | Nee |
| Zadelbreedte | 825 | 13,6 | 5,1 schermen | Ja |
| Cranklengte | 652 | 11,1 | 3,7 schermen | Ja |
| Vermogen en snelheid | 771 | 14,2 | 4,5 schermen | Nee |
| FTP en W/kg | 871 | 13,7 | 4,3 schermen | Nee |

Wat goed werkt:

- **Waarden gaan mee.** Wie zijn binnenbeen invult bij zadelhoogte, ziet bij framemaat “Je binnenbeen van de vorige calculator is al ingevuld”. Dat is precies de beleving die we willen, maar bijna niemand weet het.
- **Vaste resultaatbalk onderin op mobiel** met de uitkomst en één knop. Duidelijk en rustig.
- **Onzekerheid wordt eerlijk getoond** (“789 mm ±49 mm”), met de uitleg dat meten het bereik smaller maakt. Dit is de sterkste reden voor een account, en hij staat er al.

Wat hapert, op volgorde van ernst:

1. **Hoog — accountreden onder de vouw.** Op mobiel ziet niemand de accountknop zonder 3,4 tot 6,1 schermen te scrollen.
2. **Hoog — steeds dezelfde knoptekst.** Op elke calculator staat “Bewaar en verfijn gratis”. De specifieke reden (zweettest, gemeten FTP, zitbotmeting) staat in kleine labels erboven en valt niet op.
3. **Hoog — betaald is onzichtbaar.** 6 van de 11 calculators linken niet naar prijzen en geen enkele calculator noemt wat betaald toevoegt.
4. **Middel — geen volgende stap.** Na het resultaat volgt uitleg, geen “volgende: framemaat, je maten staan al klaar”.
5. **Middel — homepage onvolledig en deels Engels.** De Engelse H1 (“A good bikefit boosts your ride”) is een bewuste keuze en geen probleem; wel ontbreken klimplanner, vermogen, FTP en voeding ontbreken in de calculatorlijst.
6. **Middel — mobiele kop neemt een kwart van het scherm.** Logo, taalkeuze, inloggen en een tabbalk met calculators nemen samen ongeveer 210 van de 844 px. In de lokale versie valt de cookiemelding er half doorzichtig overheen; controleer dit live.
7. **Laag — voorbeeldwaarden lijken echte invoer.** Lengte 190 cm en gewicht 94 kg staan vooringevuld; een snelle bezoeker leest het resultaat van iemand anders.

## Gebruikersreis

&#91;embedded content: gebruikersreis · van publieke calculator naar betaald\]

Het scharnierpunt is het resultaat: daar staan de volgende calculator en de accountreden naast elkaar. Betaald komt pas in beeld als het profiel tegen een grens loopt.

## Calculators laten samenwerken

Deel de 11 calculators op in twee routes en laat na elk resultaat de volgende stap zien, met de waarden die al bekend zijn. Zo voelt de site als één bikefit die steeds completer wordt, niet als 11 losse rekenmachines.

| Route | Volgorde | Wat de volgende calculator al weet |
| --- | --- | --- |
| **Mijn houding** | Zadelhoogte → Framemaat → Cranklengte → Zadelbreedte → Volledige bike fit | Lengte, binnenbeen, soort fiets, gewicht |
| **Mijn rit** | Bandenspanning → Verzet → Klimplanner → Vermogen en snelheid → FTP en W/kg → Voeding en vocht | Gewicht, soort fiets, banden, verzet, FTP, ritduur |

Concreet per pagina:

- **Volgende-stapkaart direct onder het resultaat**: “Volgende: framemaat. Je lengte en binnenbeen staan al klaar.” Eén knop, geen lijst van 8 links.
- **Voortgangsregel bovenaan de route**: “Mijn houding · 2 van 5”, met vinkjes bij wat al is ingevuld. Klikbaar, maar nooit verplicht.
- **Zichtbaar maken wat al bekend is**: een kleine strook “We kennen al: 184 cm · binnenbeen 86 cm · racefiets” met “wijzig”. Dit bestaat technisch al (de melding bij framemaat), maak het vast onderdeel van elke calculator.
- **Homepage**: toon de twee routes als twee grote startknoppen in plaats van een raster van 8 kaarten, en neem alle 11 calculators op onder de routes.
- **Voorbeeldwaarden duidelijk als voorbeeld** (grijs, “voorbeeld”), en vervang ze door de bekende waarden zodra die er zijn.

## Elke keer een andere reden voor een account

Geef bij elke calculator één reden die past bij wat de gebruiker net deed, in één zin direct onder het resultaat. De knop noemt het voordeel, niet de actie: “Maak mijn bereik smaller” werkt beter dan “Bewaar en verfijn gratis”.

| Calculator | Reden voor gratis account (één zin) | Knoptekst | Waar betaald later in beeld komt |
| --- | --- | --- | --- |
| Zadelhoogte | Je bereik is nu ±49 mm. Meet nog twee keer en we maken het tot ±23 mm. | Maak mijn bereik smaller | Volledig stappenplan met volgorde van aanpassen |
| Framemaat | Bewaar je maten, dan vergelijk je straks stack en reach van je eigen fiets. | Vergelijk met mijn fiets | Nieuwe fiets beoordelen naast je huidige |
| Cranklengte | Je cranklengte hangt samen met je zadelhoogte; in je profiel rekenen ze samen. | Reken samen met mijn zadel | Fit-tabel per fiets |
| Zadelbreedte | Bewaar je zitbotmeting, dan hoef je bij een nieuw zadel niet opnieuw te meten. | Bewaar mijn zitbotmeting | Zadels vergelijken |
| Volledige bike fit | Je gegevens raken niet verloren en je bouwt je profiel verder op. | Bewaar mijn bike fit | Volledig rapport en stappenplan |
| Bandenspanning | Per fiets een eigen spanning: racefiets, gravel en mountainbike apart. | Bewaar per fiets | Onbeperkt fietsen |
| Verzet | Zet dit verzet naast je echte fiets en je geplande klim. | Koppel aan mijn fiets | Klimplanner met je eigen verzet |
| Klimplanner | Gebruik je gemeten FTP en gewicht in plaats van aannames. | Gebruik mijn eigen FTP | Klimprofielen per rit |
| Vermogen en snelheid | Rekent met je eigen fiets, houding en gewicht. | Reken met mijn fiets | Houdingvergelijking |
| FTP en W/kg | Volg je FTP door het seizoen en zie je W/kg veranderen. | Volg mijn FTP | Geschiedenis en vergelijking |
| Voeding en vocht | Doe een zweettest en we onthouden je ritten en temperaturen. | Doe mijn zweettest | Plan per rit en event |

Drie spelregels:

- **Toon het voordeel met de eigen waarde** van de gebruiker (“jouw ±49 mm”), niet een algemene belofte.
- **Herhaal niet dezelfde reden.** Houd per bezoeker bij welke reden al getoond is; de volgende calculator toont een andere.
- **De oorspronkelijke belofte blijft altijd zichtbaar** in één regel bij de knop: “Wat je hier invult nemen we mee.”

Controleer elke reden tegen wat het account vandaag doet. Een reden die nog niet live is (bijvoorbeeld FTP door het seizoen volgen) wacht tot de functie er is; anders beloven we te veel.

## Minder tekst

Halveer de zichtbare tekst per calculator door alles na het resultaat in te klappen, behalve de volgende stap en de accountreden. De tekst blijft in de HTML staan, dus vindbaarheid in Google en AI-zoekmachines gaat niet achteruit, mits ingeklapte tekst in de pagina zelf staat en niet pas na een klik wordt geladen.

| Blok op elke calculatorpagina | Advies | Waarom |
| --- | --- | --- |
| Invoer, resultaat, onzekerheidsbereik | Blijft open | Dit is de taak |
| Volgende stap + accountreden | Nieuw, open, direct onder het resultaat | Het moment waarop de gebruiker nog aandacht heeft |
| “Het korte antwoord” | Blijft open, maximaal 2 zinnen | Snel antwoord en goed voor zoekmachines |
| “Zo rekenen we”, “Rekenvoorbeeld” | Inklappen onder één regel “Hoe rekenen we dit?” | Voor de nieuwsgierige minderheid |
| “Wat dit niet vertelt”, “Waarschuwingen” | Inklappen; veiligheidswaarschuwingen (band- en velglimieten) blijven open | Veiligheid blijft altijd zichtbaar |
| “Veelgemaakte fouten” | Samenvoegen met de meetinstructie bij het invoerveld | Helpt op het moment van meten |
| “Waarom dit vertrouwen wekt”, “Waarom dit werkt” | Weghalen; een link naar de methodepagina volstaat | Herhaalt per pagina hetzelfde verhaal |
| Tweede accountblok (“Hoe verder?”) | Weghalen | Dubbel met het nieuwe blok onder het resultaat |
| Veelgestelde vragen | Ingeklapt laten (al zo) | Werkt goed |
| “Gerelateerde tools en gidsen” | Vervangen door de route uit de vorige sectie + maximaal 3 gidsen | Minder keuze, duidelijkere volgende stap |

Op de homepage: houd de calculator bovenaan en de twee routes; klap “Maak je volgende aanpassing bewust” en “Je rapport bevat de getallen die ertoe doen” samen tot één blok met drie regels en een link “Wat zit in het rapport?”.

Op mobiel: verklein de kop tot één regel (logo, inloggen, menu) en verplaats de tabbalk met calculators naar het menu of naar de route-voortgang. Dat geeft het resultaat ongeveer een kwart scherm extra.

## Verleiding naar betaald, zonder opdringerig te zijn

Laat het betaalde plan zien op het moment dat de gebruiker tegen een grens aanloopt die betaald oplost, niet als banner op elke pagina. Zo voelt het als hulp, en dat past bij de afspraak om geen pop-ups, nepurgentie of angst te gebruiken.

Vijf natuurlijke momenten:

1. **Tweede fiets toevoegen.** “Je gratis account heeft één fiets. Met het jaarabonnement (€21,50 per jaar) stel je al je fietsen af.”
2. **Profielscore op 80%.** De ring toont de laatste 20% als zichtbaar, maar vergrendeld deel, met één zin wat die velden opleveren.
3. **Het stappenplan in het rapport.** Gratis ziet de kernwaarden; de volgorde van aanpassen staat er als ingeklapte, vergrendelde stap met “Losse meting €13,50 of jaarabonnement”.
4. **Vergelijken.** Bij “vergelijk met mijn vorige fit” of “beoordeel een nieuwe fiets”.
5. **Na een aanpassing.** Een week na een opgeslagen aanpassing: “Hoe reed het? Leg het vast en vergelijk.” Servicemail, één actie.

Op de publieke calculators zelf: één rustige regel onder de accountreden, alleen op calculators waar betaald echt iets toevoegt. Bijvoorbeeld bij framemaat: “Nieuwe fiets in gedachten? Met een abonnement zet je hem naast je huidige.” Geen prijs in die regel; de prijs staat op de prijspagina en bij de grens.

Grenzen die we niet overschrijden:

- Geen pop-ups of overlays om te upgraden. Betaald mag vaker zichtbaar zijn, in steeds een andere vorm, maar altijd gekoppeld aan de eigen waarde van de gebruiker (bijgesteld 6 oktober).
- Geen aftellers of “nog maar vandaag”.
- Gratis gebruikers houden hun basisadvies, hun gegevens en alle veiligheidsinformatie.
- Een vergrendeld veld zegt in één zin wat het toevoegt; nooit alleen een slotje.

## Backlog

Begin met 1 tot en met 3: die verplaatsen de accountreden naar het moment van het resultaat en zijn binnen bestaande componenten te bouwen.

| # | Verbetering | Acceptatiecriteria | Meten |
| --- | --- | --- | --- |
| 1 | Accountreden + volgende stap direct onder het resultaat | Op 390 px staat het blok binnen 1 scherm onder de resultaatwaarde; per calculator een eigen zin en knoptekst uit de tabel; de oude knop “Bewaar en verfijn gratis” verdwijnt | Klikratio accountknop per calculator; accounts per 100 calculatorgebruikers |
| 2 | Uitleg inklappen | Alleen invoer, resultaat, kort antwoord, volgende stap, accountreden en veiligheid open; ingeklapte tekst staat in de HTML; mobiele pagina maximaal 7 schermen | Scrolldiepte; positie in Google voor de 11 calculatorzoekwoorden blijft gelijk |
| 3 | Twee routes met voortgang | Elke calculator hoort bij “Mijn houding” of “Mijn rit”; volgende-stapkaart opent de volgende calculator met bekende waarden ingevuld; strook “We kennen al” met “wijzig” | Calculators per bezoek; aandeel bezoekers met 2 of meer calculators |
| 4 | Homepage herzien | Nederlandse H1; twee routes als startknoppen; alle 11 calculators bereikbaar binnen 1 klik | Klikratio routeknoppen |
| 5 | Mobiele kop van één regel | Kop maximaal 64 px hoog op 390 px; cookiemelding bedekt kop en tabbalk niet | Visuele test op 390 px |
| 6 | Betaalde momenten in het account | Tweede fiets, profielscore 80%, stappenplan en vergelijken tonen elk één zin + prijs; geen pop-ups | Gratis → losse meting, gratis → jaarabonnement |
| 7 | Voorbeeldwaarden markeren | Voorbeeldwaarden grijs met label “voorbeeld”; bekende waarden vervangen ze | Aandeel resultaten berekend met eigen waarden |
| 8 | Reden niet herhalen | Per bezoeker wordt een al getoonde reden niet opnieuw getoond bij de volgende calculator | Klikratio tweede en derde getoonde reden |

Toets na de bouw met 5 echte fietsers (racefiets, gravel, mountainbike) op hun telefoon, met dezelfde taak als in deze test. Behandel de omzetdoelen als hypotheses tot die cijfers er zijn.

## Toetsing van het ontwerp

Het herziene ontwerp op het canvas (6 oktober, ronde 3) voldoet aan alle 15 regels. Klikdoelen en contrast zijn gemeten in een render van alle 88 schermen van de website, het riderprofiel en het afsluiten: 0 klikdoelen kleiner dan 44 px en 0 contrastfouten. De metingen in de bevindingen hierboven zijn gedaan vóór de betrouwbaarheidsrelease.

| # | Regel | Status | Toelichting |
| --- | --- | --- | --- |
| 1 | Accountreden en volgende stap direct onder het resultaat, per calculator eigen tekst | Voldoet | Alle 11 calculators via één sjabloon, plus bandenspanning en zadelhoogte |
| 2 | Uitleg na het resultaat ingeklapt | Voldoet | Calculators, en 13 gids-, klacht- en uitlegpagina's: open blijven kop, kort antwoord, veiligheid en volgende stap; de rest in uitklapblokken (tekst blijft in de HTML) |
| 3 | Twee routes met voortgang en vooringevulde waarden | Voldoet | Mijn houding (5) en Mijn rit (6), chip “Uit je eerdere invoer” |
| 4 | Homepage: routes en alle calculators binnen één klik | Voldoet | Zadelwidget met bereikbalk zoals live |
| 5 | Mobiele kop van één regel, maximaal 64 px | Voldoet | Alle mobiele schermen: logo, Inloggen of avatar, menuknop van 44 × 44 |
| 6 | Betaald zichtbaar op de natuurlijke grenzen | Voldoet | Tweede fiets, profielscore 80%, stappenplan, vergelijken, rapport en geschiedenis |
| 7 | Betaald op meerdere, verschillende manieren | Voldoet | “Betaald ±”-chip bij het resultaat, ladder, vergrendelde preview, vergrendelde 20% in de score, vergelijkingsstrook |
| 8 | Voorbeeldwaarden duidelijk als voorbeeld | Voldoet | Niet aangeraakte standaardwaarden staan grijs met label “voorbeeld”, met boven het resultaat één regel als “Voorbeeld voor iemand van 190 cm · schuif naar jouw maat”; na aanraken verdwijnen ze. Hergebruikte waarden zijn nooit een voorbeeld |
| 9 | Getallen alleen met een schuif | Voldoet | Framemaat en cassette in het fietsformulier omgezet; tekstvelden alleen voor namen, URL's en codes |
| 10 | Gemeten of geschat: logische keuze vooraf geselecteerd | Voldoet | Profiel, welkom, zadelhoogte in account, mobiele bike fit; nergens meer een lege keuze |
| 11 | Bandenspanning overal op één manier | Voldoet | Eén onderdeel (voorband lime, achterband inkt) op 10 schermen; mails tonen “5,2 bar · 75 psi” als tekst |
| 12 | Geen pop-ups, aftellers of angst voor betaald | Voldoet | De vertrekmelding gaat over gegevens bewaren en verschijnt één keer per sessie |
| 13 | Veiligheidsinformatie altijd zichtbaar | Voldoet | Zadelhoogte, Quick fix en bandenspanning |
| 14 | Alleen echte functies en actuele prijzen | Voldoet | Alle €24,50, €19,50 en “€5 korting” vervangen; previews tonen “•• mm”, geen verzonnen waarden |
| 15 | Klikdoelen minimaal 44 px en voldoende contrast | Voldoet | Gemeten in beeld op 88 schermen: 0 klikdoelen < 44 px, 0 contrastfouten (4,5:1; 3:1 voor grote tekst) |

Nog te beslissen:

- [ ] Zadelterugstand heeft geen betaald bereik; nu staat er “In je stappenplan”. Een getal toevoegen?
- [ ] Bij de upgrade van €9,50 staan nu 2 cadeaumetingen per jaar; het eerdere ontwerp gaf er 1.
- [ ] Terugbetalen bij opzeggen geldt in het ontwerp alleen na een verlenging. Zo houden?
- [ ] Het A4-rapport toont bandenspanning per ondergrond nu als verschil (“0,2 bar hoger”) in plaats van drie meters, omdat die niet op één pagina passen.
