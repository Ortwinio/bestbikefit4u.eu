---
name: "website-redesign"
description: "Herontwerp een website (belangrijkste pagina's, configurators en schermen achter de login) als interactief designcanvas in de frisse, schuifregelaar-gedreven stijl van het BestBikeFit4U-redesign."
---

# Website-redesign in canvasstijl

Deze skill legt vast hoe het BestBikeFit4U-redesign is gemaakt, zodat elk volgend herontwerp (bijv. prototyper.eu) dezelfde kwaliteit, werkwijze en ontwerptaal krijgt. Schrijf antwoorden en schermteksten in het Nederlands, tenzij de site of de gebruiker anders aangeeft.

## De standaardbriefing

Tenzij de gebruiker iets anders zegt, geldt:

- De site moet er **modern en aantrekkelijk** uitzien, en de ervaring moet **intuïtief** zijn.
- De ontwerptaal spreekt de **doelgroep** van de site aan, en dat zie je terug in **frisse kleuren**.
- Herontwerp de **belangrijkste pagina's** en **alle configurators en tools**.
- Configurators werken **intuïtief en visueel**: gebruik **liever een schuifregelaar dan een getal invoeren**.
- Vraagt de gebruiker om de schermen **achter de login**: ontwerp inloggen, het dashboard en de kernschermen van het account.

## Werkwijze

1. **Inventariseer de echte site.** Haal homepage, prijzen, tools en hoofdpagina's op met WebFetch (probeer ook `/nl`, `/en`, `/pricing`, `/sitemap.xml`).
   - Noteer het aanbod, de doelgroep, navigatie, kopteksten, CTA's, prijzen, talen en echte claims.
   - Noteer per tool elk invoerveld (label, eenheid, bereik, standaardwaarde), de stappen en de uitkomsten.
   - Blokkeert de site de toegang (403, robots): niet omzeilen. Gebruik de browser van de Claude-app of Claude in Chrome, of vraag de gebruiker om screenshots of tekst.
   - Verzin nooit cijfers of reviews. Ontbreekt iets, gebruik dan een placeholder als [JOUW PRIJS].
2. **Achter de login.** Vraag nooit om een wachtwoord in de chat en typ het ook niet zelf in. Laat de gebruiker zelf inloggen in de browser en lees daarna de schermen. Lukt dat niet, ontwerp dan op basis van de publiek beschreven functies (sessies, profielen, geschiedenis, rapporten, abonnement). Gebruik duidelijke voorbeelddata en meld dat in je antwoord.
3. **Kies de look.** Neem de ontwerptaal hieronder over. Pas alleen de accentkleuren aan op het merk of de doelgroep, volgens de regels bij "Kleur". Is er een design system gemarkeerd als standaard? Dan gaat dat voor.
4. **Bouw het canvas.** Kijk welke Artifact-types er zijn en maak het ontwerp vanuit het **Design**-type, met als titel "<site> redesign". Houd de schermindeling hieronder aan.
5. **Lever op.** Sluit kort af: welke schermen er zijn, wat de configurators intuïtief maakt, welke rekenregels tijdelijk zijn, welke aannames je deed, en één volgende stap (bijv. een mobiele versie of nog ontbrekende tools). Controleer niet zelf met screenshots, tenzij de gebruiker daarom vraagt.

## Ontwerptaal (uit het BestBikeFit4U-canvas)

### Kleur

Dit is het referentiepalet. De structuur blijft altijd hetzelfde: een licht getinte achtergrond, een diepe inkt, één fris felaccent voor vlakken en één donkerder actiekleur.

| Rol | Waarde | Gebruik |
|---|---|---|
| Achtergrond | `#F5F8F3` | pagina |
| Vlak | `#FFFFFF` | kaarten, rand `#DCE6E1` |
| Inkt | `#0F2420` | tekst, donkere secties, sidebar |
| Tekst gedempt | `#3B4F4A` / `#4A5F5A` | bodytekst, hints |
| Tekst op donker | `#FFFFFF` / `#B9CCC6` | koppen / subtekst |
| Frisaccent (lime) | `#CFF26A` | hero-vlak, resultaatvlakken, badges, bolletjes met stapnummers, altijd met inkt-tekst |
| Lime zacht | `#E6F8A8` | geselecteerde optiekaart |
| Actie (petrol) | `#0A7263`, hover `#075A4E` | primaire knoppen met witte tekst, schuifvulling, links |
| Petrol zacht | `#E1F2EE` | icoonvlakken, chips, infoblokken |
| Status | ok `#CFF26A`, let op `#FFD66B`, afwijking `#FFB199` | chips met afwijking |

Merkaanpassing: vervang het frisaccent en de actiekleur door merkkleuren met een vergelijkbare lichtheid. Het frisaccent is licht en krijgt donkere tekst. De actiekleur is donker genoeg voor witte tekst (minimaal 4.5:1). Kleuren die je moet kunnen onderscheiden, verschillen ook in lichtheid. Gebruik geen gradients en geen emoji.

### Typografie

Laad de fonts via Google Fonts in `<helmet>`:

- **Bricolage Grotesque** 700/800 voor koppen: hero 88–92 px met letter-spacing −0.035em en line-height 0.95; sectiekoppen 52–56 px; kaartkoppen 22–28 px.
- **Figtree** 400–700 voor de body: 16–21 px, line-height 1.45–1.55.
- **DM Mono** 500 voor elk getal en elke meetwaarde. Resultaten zijn groot (34–120 px), met de eenheid klein en gedempt ernaast.
- Eyebrow boven een sectie: 14 px, 700, hoofdletters, letter-spacing 0.08em, in de actiekleur.

### Vorm en ritme

- Radius: knoppen en chips 999px, kaarten 20–24 px, grote panelen 28–36 px, invoer en segmenten 12–16 px.
- Desktop is 1440 breed. Marketingpagina's hebben 120 px zijmarge, configurators 64 px, dashboard een sidebar van 264 px plus 48 px marge.
- Secties staan ~100–120 px uit elkaar. Rasters met gap 20–24 px (`repeat(N, minmax(0, 1fr))`).
- Klikdoelen zijn minimaal 44 px. Knoppen zijn 48–60 px hoog.

### Componenten

- **Header (marketing)**: een logo met een lime cirkel, links in inkt, een NL/EN-pill, "Inloggen" en een primaire pill-knop.
- **Header (tools)**: het logo, een tabbalk in een witte pill met alle calculators (de actieve tab is inkt met witte tekst) en "Inloggen".
- **Knoppen**: primair is petrol met witte tekst. Secundair heeft een rand van 2 px in inkt. Op een lime vlak is de knop inkt met witte tekst.
- **Toolkaarten**: een wit vlak met een icoon (stroke-SVG) in een petrol-zacht vierkant. De uitgelichte kaart is inkt met een lime badge.
- **Donker statblok**: inkt, getallen in lime, met verticale scheidingslijnen.
- **Testimonial**: de concrete verandering in een lime DM Mono-chip ("zadel −4 mm"), met het citaat eronder.
- **Rapport-/upgradeblok**: een inkt-paneel met een checklist, daarnaast een lime kaart met de CTA's.
- **Dashboard-sidebar**: inkt, het actieve item lime, onderaan het abonnement met gebruiksbalk en een upgradeknop.

## Schermindeling op het canvas

Maak drie rijen, elk met een `title1`-notitie op minstens 223 px boven de rij. Houd 80 px tussen artboards in een rij en ~420 px tussen rijen (inclusief de ruimte voor de notitie). Geef elk artboard met werkende bediening `"is_interactive": true`, en link alle navigatie tussen de artboards.

1. **Pagina's**
   - **Home**: header, dan een hero in twee kolommen. Links de belofte, twee CTA's en een rij met social proof. Rechts een lime vlak met een illustratie en een witte *werkende teaser* van de hoofdtool.
   - Daarna een donker statblok, een toolraster (4 kolommen), "hoe het werkt" (3 stappen, de laatste in petrol), "start bij je probleem" (4 kaarten), testimonials, een rapport- of upgradeblok en een footer.
   - **Prijzen**: twee kaarten (Free wit, Pro inkt met badge), een vergelijkingstabel en een lime CTA-band.
2. **Configurators**: één artboard per tool, met dit vaste patroon:
   - Een eyebrow met naam en tijdsduur, en een kop als vraag ("Hoe hoog moet je zadel?").
   - **Links (520–560 px)**: invoerkaarten met genummerde stappen (1, 2, 3 in een lime bolletje).
   - **Rechts**: een live visual op een lime of inkt vlak, resultaattegels in DM Mono, een blok "Pas in deze volgorde aan" en een CTA om het resultaat in je account te bewaren.
3. **Achter de login**
   - **Inloggen**: een split-screen met links een lime vlak met illustratie en belofte, en rechts tabs voor Inloggen en Account aanmaken, een social login, e-mail en wachtwoord, en een link naar de gratis tool.
   - **Dashboard**: een begroeting en "Nieuwe sessie", het actieplan als afvinkbare stappen (inkt-paneel), een check-in met schuifregelaars, objectkaarten met een scorering, recente sessies en snelle links.
   - **Detail**: "Nu vs. doel", een visual met doel- en huidige markers, en per maat een schuif voor de huidige waarde met doelstreepje en verschilchip. Daaronder een score die live meerekent en een plan met de top-3 aanpassingen.
   - **Geschiedenis/rapporten**: een lijngrafiek naar het doel met een testmarge-band, een comfort- of resultaatbalk per sessie, een tabel met rapportknoppen (PDF op slot voor Free) en een upgradeband.

## Configurators: de interactieregels

1. **Nooit een getal laten typen.** Elke numerieke invoer is een schuifregelaar met het label links en de waarde rechts, groot in DM Mono met de eenheid erbij. Zet waar nuttig schaalstreepjes of een uitleg onder de balk.
2. **Niveaus** (bijv. lenigheid 1–5) zijn schuifregelaars met een woordlabel ("Zeer beperkt … Uitstekend") en een tip om jezelf in te schatten.
3. **Keuzes** zijn segmentknoppen of optiekaarten met een korte uitleg, met `aria-pressed`. Nooit een dropdown.
4. **Live resultaat**: de uitkomst en de visual reageren direct.
   - Een tekening waarvan de geometrie uit de waarden volgt, met maatlabels erin.
   - Een halve-cirkelmeter voor spanning of druk.
   - Een maatschaal waarop de aanbevolen maat oplicht en een twijfelmaat een rand krijgt.
   - Een proportiemeter met een markeerstreep.
5. **Vergelijken met nu**: een extra schuif voor "je huidige waarde" met de testmarge als lime zone, een statuschip (binnen marge / te hoog / te laag) en concreet advies ("Verlaag in 2 stappen van max. 5 mm").
6. **Vertrouwen**: een betrouwbaarheidsmeter die oploopt naarmate de gebruiker meer verfijnt, een marge in plaats van schijnprecisie, en "wat bepaalt deze uitkomst" met balkjes per factor.
7. **Minder is meer**: geavanceerde invoer zit achter een uitklapknop. Gekoppelde velden (voor/achter) krijgen een koppeltoggle.
8. Rekenregels die je zelf benadert, zijn **tijdelijk**. Zeg dat in je antwoord: de echte engine van de site hoort ervoor in de plaats te komen.

## Techniek (Design-type, `.dc.html`)

- Lees de format-referentie van het type vóór het eerste artboard. Houd `<script src="./support.js"></script>` exact zo.
- Het root-element heeft een vaste `width`/`height` gelijk aan het board en `$preview`. Voor `lang` gebruik je de taal van de teksten.
- Holes zijn alleen dotted lookups. Reken alles uit in `renderVals()`. Handlers geef je vanuit `renderVals()` terug. Zet state in de constructor.
- `<sc-for>` en `<sc-if>` krijgen altijd hun `hint-*`-attributen. Gebruik echte `<button>`, `<label for>` en `<input>`, en `aria-label` op knoppen met alleen een icoon.
- Publiceren: eerst `project/canvas.json` (met alle boards) en `project/Main.dc.html` samen, daarna de rest. Bij een latere wijziging stuur je alleen de gewijzigde bestanden mee. Het index-bestand stuur je alleen mee bij een layoutwijziging, en dan lees je het eerst opnieuw.

### Helmet (per artboard)

```html
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&amp;family=DM+Mono:wght@500&amp;family=Figtree:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<style>
body{margin:0;background:#F5F8F3;font-family:Figtree,system-ui,sans-serif;color:#0F2420}
a{color:#0A7263}a:hover{color:#075A4E}
button,input{font-family:inherit}
.rng{-webkit-appearance:none;appearance:none;background:transparent;margin:0;height:44px;cursor:pointer}
.rng::-webkit-slider-runnable-track{height:44px;background:transparent}
.rng::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;margin-top:7px;border-radius:50%;background:#FFFFFF;border:4px solid #0A7263;box-shadow:0 2px 8px rgba(15,36,32,.25)}
.rng::-moz-range-track{height:44px;background:transparent}
.rng::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#FFFFFF;border:4px solid #0A7263}
.rng:focus-visible{outline:3px solid #9CC21F;outline-offset:2px;border-radius:12px}
</style>
</helmet>
```

### Schuifregelaar met gevulde balk

```html
<div style="display: flex; justify-content: space-between; align-items: baseline">
  <label for="x-height" style="font-weight: 600">Lichaamslengte</label>
  <div style="font-family: 'DM Mono', monospace; font-size: 24px">{{height}}<span style="font-size: 14px; color: #4A5F5A"> cm</span></div>
</div>
<div style="position: relative; height: 44px">
  <div style="position: absolute; left: 0; right: 0; top: 18px; height: 8px; border-radius: 99px; background: #DCE6E1"></div>
  <div style="position: absolute; left: 0; top: 18px; height: 8px; border-radius: 99px; background: #0A7263; width: {{heightPct}}%"></div>
  <input id="x-height" class="rng" type="range" min="150" max="205" step="1" value="{{height}}" onChange="{{setHeight}}" style="position: absolute; left: 0; top: 0; width: 100%">
</div>
```

In `renderVals()`: `heightPct: ((s.height - 150) / 55) * 100` en `setHeight: (e) => this.setState({ height: Number(e.target.value) })`.

### Segmentknoppen

```js
const goals = ['Comfort', 'Balans', 'Prestatie', 'Aero'].map((label, i) => ({
  label, pressed: String(s.goal === i),
  bg: s.goal === i ? '#FFFFFF' : 'transparent',
  fg: s.goal === i ? '#0F2420' : '#3B4F4A',
  shadow: s.goal === i ? '0 1px 4px rgba(15,36,32,.18)' : 'none',
  pick: () => this.setState({ goal: i })
}));
```

```html
<div role="group" aria-label="Doel" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; padding: 5px; border-radius: 16px; background: #EEF3EF">
  <sc-for list="{{goals}}" as="g" hint-placeholder-count="4">
    <button type="button" aria-pressed="{{g.pressed}}" onClick="{{g.pick}}" style="height: 44px; border: 0; border-radius: 12px; background: {{g.bg}}; color: {{g.fg}}; font-weight: 700; box-shadow: {{g.shadow}}">{{g.label}}</button>
  </sc-for>
</div>
```

### Halve-cirkelmeter

De boog is π·90 ≈ 282.7 lang. In `renderVals()` geldt `dash: ((v / max) * 282.7).toFixed(1) + ' 400'`.

```html
<svg width="300" height="170" viewBox="0 0 220 128" fill="none" aria-hidden="true">
  <path d="M20 118A90 90 0 0 1 200 118" stroke="#B6D94C" stroke-width="16" stroke-linecap="round"></path>
  <path d="M20 118A90 90 0 0 1 200 118" stroke="#0F2420" stroke-width="16" stroke-linecap="round" stroke-dasharray="{{gg.dash}}"></path>
</svg>
```

### Live tekening

Reken punten in `renderVals()` uit als getallen of path-strings, bijv. `frame: 'M120 264L250 287L' + f(x) + ' ' + f(y)`. Bind ze aan SVG-attributen (`x1="{{g.sx}}"`, `d="{{g.frame}}"`). Maatlabels zijn een `rect` met een `text` in DM Mono, vlak bij het punt waar ze bij horen. Vergroot kleine verschillen uit, zodat ze zichtbaar zijn, en zeg dat erbij.

## Kwaliteitscheck vóór oplevering

- Staat elke numerieke invoer als schuifregelaar? En elke keuze als segmentknop of kaart?
- Reageert elk resultaat live, en heeft elke tool een visual en een concrete volgende stap?
- Zijn alle cijfers en claims echt, of duidelijk gemarkeerd als placeholder of voorbeelddata?
- Is het contrast in orde (witte tekst alleen op petrol of inkt, lime altijd met inkt-tekst) en zijn de klikdoelen minimaal 44 px?
- Linkt de navigatie tussen de artboards, en staan de titelnotities boven elke rij?