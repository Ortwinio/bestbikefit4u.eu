# 03 — Correcties bestaande boards

Codex A · 29 september 2026 · concept voor lead-QA.

Alle vijf bestanden zijn afgeleid van de overeenkomstige `canvas/`-snapshot en staan uitsluitend in `drafts/`. Geen appcode, canvasbestand of commit gewijzigd door deze taak. De README en overige taakbestanden zijn eigendom van de lead/andere agents en zijn niet door Codex A bewerkt.

## BikeFit.dc.html

- **BF1:** lichaamslengte loopt van 130–210 cm, stap 1; schaal en vulling volgen mee. De bestaande app-mismatch 140–220 cm blijft voor fase 6.
- **BF2:** binnenbeenlengte loopt van 55–105 cm, stap 0,5, inclusief aangepaste schuifvulling.
- **BF3:** de zadelband toont afgerond 0,86–0,91 × binnenbeenlengte in mm; kleine aanpasstappen zijn afzonderlijk testadvies, geen persoonlijke ±3-mm-engine-uitkomst.
- **BF4:** drop gebruikt categoriegrenzen road 40–150, gravel 20–120, MTB −10–70 en city −140–40 mm; negatief beweegt het stuur boven het zadel en krijgt opwaartse pijl/copy.
- **BF5:** openbare lengte-afhankelijke cm-banden voor road/gravel en letterbanden voor MTB/city vervangen de enkelvoudige maat en city-cm-shortcut; dit is expliciet een voorlopige shortlist.
- **BF6:** setback is een doelpositie van de zadelneus achter de trapas (BB), zonder ±; de rekenregel gebruikt categorie- en doeloffsets.
- **BF7:** een expliciete herkomstkeuze onderscheidt voorbeeldmaten, zelf gemeten en geschat; de voorlopige invoerkwaliteit gebruikt herkomst, aanwezige maten/categorie, drie ingevulde verfijningen en verhoudingwaarschuwingen uit het publieke contract. Herhaald klikken geeft geen extra punten. Voorbeeldmodus toont geen echte confidence-score.
- **BF8:** de drie stappen blijven de openbare startvolgorde; aanvullende tekst onderscheidt het volledige accountplan en noemt cleats → zadelhoogte → setback → drop → stuurpen. Deze board wordt niet voorgesteld als de volledige accountflow.

Aanvullend binnen deze fixes: categorie beïnvloedt zadelhoogte en drop; MTB/city-Aero wordt als Prestatie behandeld en toegelicht. De illustratie heet niet-op-schaal en resultaten heten een voorlopig rekenvoorbeeld. De reach blijft een voorlopige benadering met bronverwijzing, geen vervanging van de productie-adapter.

## SaddleHeight.dc.html

- **SH1:** binnenbeenlengte 55–105 cm, stap 0,5; schaal en vulling aangepast.
- **SH2:** `current` blijft exact de opgegeven huidige hoogte; de displayschaal omvat huidige waarde en engineband en verandert nooit de meting. Die displayschaal is een ontwerpkeuze, geen nieuwe enginevalidatiegrens.
- **SH3:** vier categorieknoppen toegevoegd; categoriecoëfficiënten en effectieve ambitie beïnvloeden de voorlopige startwaarde.
- **SH4:** groene zone en getoonde grenzen vertegenwoordigen de afgeronde 0,86–0,91-engineband; tekst onderscheidt deze van een persoonlijke testmarge en kleine teststappen.
- **SH5:** vergelijking toont boven/onder de startwaarde plus expliciet doel minus huidig; geen diagnose “te hoog/laag”, automatische stap-aantallen of claim van een perfecte positie.
- **SH6:** beenfiguur blijft een schematische illustratie; numerieke kniehoek en doelhoek verwijderd. Alleen de getekende beweging wordt begrensd, niet de ingevoerde zadelhoogte.

## FrameSize.dc.html

- **FS1:** lichaamslengte 130–210 cm, stap 1; schaal en vulling aangepast.
- **FS2:** binnenbeenlengte 55–105 cm, stap 0,5; schuifvulling aangepast.
- **FS3:** resultaat en maatschaal gebruiken exact de openbare shortlistbanden en grenslengtes: zes cm-banden voor road/gravel en vijf letterbanden voor MTB/city; geen inch- of city-cm-conversie. Binnenbeenlengte verandert de maatband niet.
- **FS4:** buurmaatbeslissing en “Geen twijfelgeval” verwijderd; copy vraagt vergelijking van stack, reach en cockpit bij de fabrikant.
- **FS5:** verhouding onder 0,41 of boven 0,54 geeft hermeten-advies; geen automatische maat omhoog/omlaag of claim dat standaardgeometrie wel past.

De verhoudingmeter blijft beschrijvende meetcontext. Het grote maatresultaat gebruikt DM Mono en een passende tekstgrootte voor een volledige maatband.

## TirePressure.dc.html

- **TP1:** discipline heeft een eigen factor 1 / 0,72 / 0,5, onafhankelijk van breedte-/ondergrondpresets; deze board blijft openbaar met race/gravel/MTB. TT is alleen accountscope en daarom niet toegevoegd.
- **TP2:** lichaamsgewicht 35–160 kg, stap 1; schuifvulling aangepast.
- **TP3:** voorbreedte 18–80 mm, stap 1; schuifvulling aangepast.
- **TP4:** achterbreedte 18–80 mm, stap 1; gekoppelde en losse invoer blijven werken.
- **TP5:** fietsgewicht 3–20 kg, stap 0,1 en standaard 8 kg; bagage afzonderlijk 0–30 kg, stap 1, standaard 0. Bagage gebruikt alleen de extra achterdrukterm; de basislast blijft rijder + fiets. Bagage is zichtbaar een uitbreiding uit de accountengine; het uitklappen van opties schakelt geen volledige accountmodus in.
- **TP6:** disciplinegrenzen 4–9 / 1,5–5 / 0,8–3,5 bar, met achterdruk minimaal voordruk; bar eerst afgerond, PSI daaruit berekend. De board benoemt de uitkomsten als voorlopig rekenvoorbeeld.
- **TP7:** beide meters schalen tot het disciplinemaximum en tonen het schaalbereik én de engineband.
- **TP8:** de weggelaten velgbreedte/karkas/nat-weer-invoer wordt expliciet beperkt tot deze basispreview; waarschuwingen hebben een zichtbaar statusvak, werkende basisregels en `[ENGINEWAARSCHUWINGEN]` voor de nog niet gekoppelde account-/materiaalcontrole. Onbekende materiaalgrenzen geven nooit een veiligheidsvrijgave.

Binnen de boardregels: ondergrond is nu zes keuzeknoppen in plaats van een categorische schuif. De kwalitatieve invoerbalken heten geen effectpercentages; de koppeltoggle is 44 px hoog. De bagagestap volgt `src/components/ui/NumberInput.tsx:77` (standaard 1) in de accountinvoer van `StepWeightGoal.tsx:70`. De verdwenen ondergrondkleuren en de rand van de uitklapknop zijn vervangen door het toegestane palet.

## Login.dc.html

- Rechterpaneel vervangen door één gedeelde aanmeld-/accountflow met e-mail- en codestaat via `sc-if`; wachtwoord, wachtwoord-resetlink en aparte registratievelden verwijderd.
- E-mailveld met label en formaatcontrole, “Stuur inlogcode” en Google-knop; codestaat met gelabeld veld voor zes cijfers, numeriek toetsenbord, eenmalige-code-autofill, “Bevestig code”, “Opnieuw sturen” en “Ander e-mailadres”.
- Opnieuw sturen wist de oude code; wijzigen keert terug met het e-mailadres behouden. Bevestigen controleert alleen het voorbeeldformaat en ontsluit een expliciet voorbeelddashboard.
- Geen netwerk/auth-verzoeken: zichtbare demotekst maakt duidelijk dat de board geen e-mail verstuurt en geen echte code of Google-login verifieert. De app blijft de bron voor Resend/Google-auth.
- Linkerpaneel, illustratie en afmetingen behouden; uitsluitend de bestaande off-palette tekstkleur `#1F3A34` vervangen door `#3B4F4A`, zodat de verplichte checker geen waarschuwing geeft.

## Gedeelde tabbar en formules

- Alle vier configurators: Bike fit · Zadelhoogte · Framemaat · Bandenspanning · Cranklengte · Zadelbreedte · Verzet · Meer. Nieuwe tools wijzen naar de afgesproken bestandsnamen; Meer naar `Main.dc.html`. Elke actieve tab heeft `aria-current="page"`, inkt met witte tekst; tabhoogte minimaal 44 px. Compactere padding houdt de volledige rij binnen het bestaande artboard.
- Rekenregels hebben de gevraagde `VOORLOPIGE REKENREGEL — echte engine: file:line`-comments. Ook afgeleide schuifvullingen, eenheden, vergelijkingen en illustratiegeometrie zijn gemarkeerd; pixels zijn ontwerpafleidingen van het genoemde contract, geen engine-uitvoer.
- Geen volledige engine ingebouwd. De opmerkingen markeren ook overgenomen lookup-/guardrailregels als voorlopige canvasimplementatie tot integratie met de productiecode.

## Validatie

- `node plans/redesign-canvas/check-board.mjs plans/redesign-canvas/drafts/{BikeFit,SaddleHeight,FrameSize,TirePressure,Login}.dc.html`: alle vijf PASS, zonder waarschuwingen.
- Uitvoering van alle vijf logic-classes in Node VM: confidence verandert niet door herhaald selecteren; vreemde meetverhouding verlaagt de score; city-drop is negatief en stuurt de tekening omhoog; grenslengtes geven de juiste aantallen maatbanden en maatbanden veranderen niet met binnenbeenlengte.
- Huidige zadelhoogte blijft 755 mm bij binnenbeenlengtes 55, 84 en 105 cm; enginebanden kloppen en illustratiecoördinaten blijven eindig.
- Drukcombinaties voor drie disciplines, drie gewichten en afzonderlijke voor-/achterbreedtes: binnen categoriegrenzen, achter ≥ voor, PSI consistent met afgeronde bar; gekoppelde/losse breedtes gecontroleerd.
- Login: e-mail → code, opschonen tot zes cijfers, bevestigen, opnieuw sturen en terug naar e-mail gecontroleerd.
- Lokale headless Chromium-layoutcontrole bij 1440 px, met uitgeklapte drukopties: alle vijf behouden hun oorspronkelijke artboardhoogte en geen elementen buiten het artboard; geen screenshots of bestanden gegenereerd. Deze controle gebruikt uitgewerkte templatewaarden en lokale fallbackfonts, niet de echte canvasruntime. Definitieve Play-/font-QA blijft bij de lead.
- Snapshot-versus-draft-diffs beoordeeld: wijzigingen beperken zich tot bovenstaande correcties, bijbehorende toelichting/rekencomments, tabbar en palet-/aanraakdoelcorrecties. Bestaande overige secties en root/previewmaten blijven behouden.

Geen must-fix-item stilzwijgend overgeslagen. BF8 en TP1 zijn bewust naar de openbare scope begrensd; echte accountwaarschuwingen, productie-auth en definitieve enginekoppeling zijn zichtbaar als integratiepunten, niet als werkende canvasbackend gepresenteerd.
