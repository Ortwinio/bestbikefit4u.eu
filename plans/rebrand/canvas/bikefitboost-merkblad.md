# BikeFitBoost merkblad

**Versie 1.0 · 3 oktober 2026**

Dit merkblad legt vast hoe het logo van BikeFitBoost eruitziet en waar je welke variant gebruikt, met de kleuren en conventies erbij. Alle bestanden staan in `bikefitboost-logoset.zip`.

---

## 1. De naam

- Schrijf altijd **BikeFitBoost**: één woord, met hoofdletters B, F en B.
- Niet: Bike Fit Boost, Bikefitboost, BIKEFITBOOST, BFB.
- In lopende tekst gebruik je de naam zonder opmaak. Het kleuraccent op "Boost" hoort alleen bij het logo.
- Domein: **bikefitboost.eu**. E-mailadressen eindigen op `@bikefitboost.eu`, bijvoorbeeld `info@` en `support@`.
- Een webadres schrijf je in kleine letters: bikefitboost.eu.

---

## 2. Het logo

Het logo bestaat uit twee delen:

| Onderdeel | Beschrijving |
|---|---|
| **Beeldmerk** | Een lijnfiets die 10 graden omhoog kantelt op een lime cirkel, met drie snelheidsstrepen die links uit de cirkel schieten. De fiets wordt gelanceerd: in beweging, en het gaat steeds beter. |
| **Woordmerk** | "BikeFit" + "Boost" in Bricolage Grotesque ExtraBold (800). "Boost" staat altijd in de accentkleur. |

De letters in de logobestanden zijn omgezet naar vormen. Typ het woordmerk nooit zelf opnieuw, ook niet in Bricolage: gebruik altijd de bestanden.

### Opbouw

- Het beeldmerk staat links van het woordmerk, verticaal gecentreerd op de hoofdletterhoogte.
- De ruimte tussen beeldmerk en woordmerk is ongeveer een vijfde van de hoogte van het beeldmerk.
- De strepen horen bij het beeldmerk. Laat ze nooit weg en verplaats ze nooit.

---

## 3. Logovarianten en wanneer je ze gebruikt

| Variant | Bestand | Gebruik |
|---|---|---|
| **Horizontaal** | `svg/logo-horizontaal.svg` | De standaard. Website-header, e-mailheader, PDF-rapport en documenten op een lichte achtergrond (wit of papier). |
| **Horizontaal negatief** | `svg/logo-horizontaal-negatief.svg` | Op inkt (#0F2420): website-footer, dashboard-sidebar, donkere social-posts en presentaties. |
| **Gestapeld** | `svg/logo-gestapeld.svg` | Vierkante of hoge plekken: inlogscherm, flyer, standbord, merchandise. |
| **Gestapeld negatief** | `svg/logo-gestapeld-negatief.svg` | Vierkante plekken op inkt. |
| **Zwart** | `svg/logo-horizontaal-zwart.svg` | Eenkleurig drukwerk, faxen, stempels, gravures, en op een lime achtergrond. |
| **Wit** | `svg/logo-horizontaal-wit.svg` | Eenkleurig op foto's of donkere vlakken waar lime niet past, zoals textielbedrukking. |
| **Beeldmerk** | `svg/beeldmerk.svg` (+ `-negatief`, `-zwart`, `-wit`) | Waar de naam al in beeld staat of de ruimte klein is: app-icoon, avatar, kleine knoppen, watermerk. |
| **Favicon** | `favicon/favicon.ico`, `favicon.svg` | Browsertabblad en bladwijzers. Vereenvoudigd: fiets en strepen binnen de cirkel. |
| **App-iconen** | `favicon/apple-touch-icon.png`, `android-chrome-*.png`, `maskable-512.png` | Beginscherm op telefoon en de webapp (PWA). Inkt vlak met de badge. |
| **Social-avatar** | `png/avatar-1080.png` | Profielfoto op Instagram, LinkedIn, Strava en YouTube. |
| **Deelafbeelding** | `social/og-image-1200x630.png` | Standaardafbeelding als een pagina wordt gedeeld (Open Graph). |

### Welk logo op welke achtergrond

| Achtergrond | Logo |
|---|---|
| Wit #FFFFFF of papier #F5F8F3 | Horizontaal (standaard) |
| Petrol-zacht #E1F2EE | Horizontaal |
| Inkt #0F2420 | Horizontaal negatief |
| Lime #CFF26A | Zwart, of het donkere beeldmerk (inkt cirkel, lime fiets). **Nooit** de lime cirkel op lime. |
| Petrol #0A7263 | Wit |
| Foto, rustig en licht | Horizontaal, met genoeg vrije ruimte |
| Foto, druk of donker | Wit of negatief op een inkt vlak |

---

## 4. Vrije ruimte en minimale grootte

- **Vrije ruimte:** rondom het logo minstens de **halve hoogte van het beeldmerk**. Daarbinnen komt geen tekst, rand of ander beeld.
- **Minimale grootte:**

| Toepassing | Minimaal |
|---|---|
| Horizontaal logo, scherm | 140 px breed |
| Horizontaal logo, print | 35 mm breed |
| Gestapeld logo, scherm | 96 px breed |
| Beeldmerk | 24 px / 6 mm |
| Kleiner dan 24 px | Favicon |

- **Standaardmaten op de website:** headerlogo 34 px hoog, footerlogo 34 px hoog, sidebarlogo 32 px hoog.
- **E-mail en PDF:** het logo als PNG (`logo-horizontaal-960.png`), getoond op 30 px hoog (172 × 30 px).

---

## 5. Kleuren

### Merkkleuren

| Naam | Hex | RGB | Rol | Tekst erop |
|---|---|---|---|---|
| **Lime** | `#CFF26A` | 207 242 106 | Cirkel van het beeldmerk; hero-vlakken, resultaten, badges | Alleen inkt |
| **Petrol** | `#0A7263` | 10 114 99 | Accent op licht: "Boost" en de strepen in het logo, primaire knoppen, links | Wit |
| **Inkt** | `#0F2420` | 15 36 32 | Fiets in het beeldmerk, tekst, donkere vlakken | Wit, lime |
| **Papier** | `#F5F8F3` | 245 248 243 | Paginagrond | Inkt |
| **Wit** | `#FFFFFF` | 255 255 255 | Kaarten, logo-achtergrond | Inkt |

### Ondersteunende kleuren

| Naam | Hex | Rol |
|---|---|---|
| Lime zacht | `#E6F8A8` | Geselecteerde optie |
| Petrol hover | `#075A4E` | Hover op petrol-knoppen |
| Petrol zacht | `#E1F2EE` | Icoonvlakken, chips, infoblokken |
| Tekst | `#3B4F4A` | Bodytekst |
| Gedempt | `#4A5F5A` | Hints, bijschriften |
| Op donker | `#B9CCC6` | Subtekst op inkt |
| Rand | `#DCE6E1` | Randen, lege schuifbalken |
| Let op | `#FFD66B` | Waarschuwingschip |
| Afwijking | `#FFB199` | Afwijkingschip |

### Kleuren in het logo

| Logo-onderdeel | Op licht | Op donker | Zwart | Wit |
|---|---|---|---|---|
| Cirkel | Lime | Lime | Inkt | Wit |
| Fiets | Inkt | Inkt | Wit | Inkt |
| Strepen | Petrol | Lime | Inkt | Wit |
| "BikeFit" | Inkt | Wit | Inkt | Wit |
| "Boost" | Petrol | Lime | Inkt | Wit |

### Kleurregels

- Per scherm of uiting is er één dominant accent: **lime voor vlakken, petrol voor acties**.
- Lime nooit als tekstkleur op een lichte achtergrond.
- Witte tekst alleen op petrol of inkt.
- Bodytekst heeft minimaal 4,5:1 contrast.
- Geen verlopen, geen extra kleuren, geen transparante versies van het logo.

### CSS-tokens

```css
:root{
  --bfb-lime:#CFF26A; --bfb-lime-zacht:#E6F8A8;
  --bfb-petrol:#0A7263; --bfb-petrol-hover:#075A4E; --bfb-petrol-zacht:#E1F2EE;
  --bfb-inkt:#0F2420; --bfb-tekst:#3B4F4A; --bfb-gedempt:#4A5F5A; --bfb-op-donker:#B9CCC6;
  --bfb-rand:#DCE6E1; --bfb-papier:#F5F8F3; --bfb-wit:#FFFFFF;
  --bfb-font-display:'Bricolage Grotesque',sans-serif;
  --bfb-font-body:Figtree,system-ui,sans-serif;
  --bfb-font-cijfers:'DM Mono',ui-monospace,monospace;
}
```

---

## 6. Typografie

| Lettertype | Gewicht | Gebruik |
|---|---|---|
| **Bricolage Grotesque** | 700 / 800 | Koppen en het woordmerk. Hero 88–92 px (letterafstand −0.035em), sectiekop 52–56 px, kaartkop 22–28 px. |
| **Figtree** | 400–700 | Bodytekst 16–21 px, regelhoogte 1,45–1,55. Knoppen 15–18 px op 700. |
| **DM Mono** | 500 | Elk getal en elke meetwaarde, en prijzen. Met de eenheid klein en gedempt erachter: `742 mm`, `€24,50`. |

- **Eyebrow** boven een sectie: 14 px, 700, hoofdletters, letterafstand 0.08em, in petrol.
- Laden via Google Fonts:
  `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@500&family=Figtree:wght@400;500;600;700&display=swap`
- Gebruik geen Inter, Roboto of Arial als zichtbare letter.

---

## 7. Wat je niet doet met het logo

- Niet uitrekken, samendrukken of schuin zetten.
- Het logo niet extra draaien. De kanteling van de fiets zit al in het ontwerp.
- Geen schaduw, gloed, rand, omlijning of 3D-effect.
- Het woordmerk niet opnieuw typen of in een ander lettertype zetten.
- "Boost" niet in een andere kleur dan petrol (op licht) of lime (op donker), behalve in de eenkleurige versies.
- De strepen niet weglaten, verplaatsen of een andere kleur geven dan in de tabel.
- De lime cirkel niet op een lime vlak, en het logo niet op een drukke foto zonder rustig vlak.
- Het logo niet combineren met andere logo's binnen de vrije ruimte.
- Geen oude BestBikeFit4U-elementen naast het nieuwe logo.

---

## 8. Iconen en beeld

- **Iconen:** lijniconen op een raster van 24 px, lijndikte 2, ronde uiteinden, kleur via `currentColor`. In een vlak van 52 px (radius 16) in petrol-zacht met een petrol icoon, of in lime met een inkt icoon voor het uitgelichte item. Geen emoji en geen gevulde iconensets.
- **Beeld:** geen stockfoto's. Gebruik pentekeningen in huisstijl: inktlijnen, arcering in de schaduw en één lime accent net naast de lijn. Geen tekst in beelden.

---

## 9. Vorm en componenten

| Element | Conventie |
|---|---|
| Knoppen en chips | Radius 999 px, hoogte 48–60 px, klikdoel minimaal 44 px |
| Primaire knop | Petrol met witte tekst; op lime: inkt met witte tekst |
| Secundaire knop | Rand van 2 px in inkt, transparant |
| Velden en segmenten | Radius 12–16 px |
| Kaarten | Wit, rand #DCE6E1, radius 20–24 px |
| Grote panelen | Radius 28–36 px |
| Schaduw | Alleen onder zwevende kaarten: `0 18px 40px rgba(15,36,32,.12)` |
| Ritme | Desktop 1440 px; marges 120 px (marketing) of 64 px (tools); secties 100–120 px uit elkaar; rasters met een tussenruimte van 20–24 px |

---

## 10. Tone of voice

- **Concreet:** noem getallen en de volgorde van aanpassen. "Zadel 4 mm lager", niet "optimaliseer je zithouding".
- **Eerlijk over grenzen:** online is een sterk startpunt; bij complexe klachten verwijs je naar een fitter. Geen schijnprecisie.
- **Je-vorm,** korte zinnen, actieve werkwoorden. Knoppen beginnen met een werkwoord: "Start gratis bike fit".
- **Nederlands eerst,** Engels als tweede taal. Vakwoorden blijven Engels: stack, reach, drop, cleat, gravel.
- **Geen** reeksen uitroeptekens, hypewoorden ("revolutionair", "ultiem"), verzonnen cijfers of afteltimers.
- **Merkbelofte:** "Haal meer uit elke rit."

---

## 11. Websitecode

In de `<head>` van elke pagina:

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0F2420">
<meta property="og:site_name" content="BikeFitBoost">
<meta property="og:image" content="https://bikefitboost.eu/og-image-1200x630.png">
```

---

## 12. Bestandsoverzicht (`bikefitboost-logoset.zip`)

| Map | Inhoud |
|---|---|
| `svg/` | `logo-horizontaal`, `-negatief`, `-zwart`, `-wit`; `logo-gestapeld`, `-negatief`; `beeldmerk`, `-negatief`, `-zwart`, `-wit` |
| `png/` | Logo's horizontaal en gestapeld (licht en negatief) op 480 en 960 px; beeldmerk op 256, 512 en 1024 px; `avatar-1080.png` |
| `favicon/` | `favicon.ico` (16/32/48), `favicon.svg`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `android-chrome-192.png`, `android-chrome-512.png`, `maskable-512.png`, `site.webmanifest` |
| `social/` | `og-image-1200x630.png` en `og-image.svg` |
| (hoofdmap) | `LEESMIJ.md` en `bfb_set.py`, het script waarmee je de set opnieuw maakt of nieuwe social-afbeeldingen genereert |

**Gebruik SVG waar het kan** (web, documenten, drukwerk). Gebruik PNG alleen waar SVG niet werkt, zoals e-mail en sommige social-platforms.
