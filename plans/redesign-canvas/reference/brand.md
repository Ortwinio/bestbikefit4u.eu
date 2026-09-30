---
name: "bestbikefit4u-huisstijl"
description: "De BestBikeFit4U-huisstijl: kleuren, typografie, logo, iconen, tone of voice en beeld. Plus een script voor logoset, favicons en social-afbeeldingen. Gebruik bij alles wat er als BestBikeFit4U uit moet zien."
---

# BestBikeFit4U-huisstijl

Gebruik deze skill bij alles wat naar buiten gaat als BestBikeFit4U: webpagina's, e-mails, social posts, rapporten, presentaties, drukwerk, en nieuwe logo- of social-bestanden. Voor volledige websiteschermen is er ook **website-redesign**, en voor illustraties **bestbikefit4u-illustraties**. Deze skill is de basis waar die twee op leunen.

## Het merk in het kort

- **Wat**: online bikefitting. Met je lichaamsmaten en rijstijl krijg je concrete afstelwaarden in millimeters, voor comfort en prestatie.
- **Voor wie**: fietsers (race, gravel, MTB, stad/tour) die meer uit hun fiets willen halen, of van klachten af willen.
- **Belofte**: "Haal meer uit elke rit." Concreet, eerlijk en direct toepasbaar.
- **Karakter**: fris, deskundig, nuchter. Sportief zonder macho te zijn, technisch zonder jargon.

## Tone of voice

- **Concreet**: noem getallen en de volgorde van aanpassen. "Zadel 4 mm lager", niet "optimaliseer je zithouding".
- **Eerlijk over grenzen**: online is een sterk startpunt. Bij complexe klachten verwijs je naar een fitter ter plaatse. Geen schijnprecisie, en een testmarge in plaats van één absoluut getal.
- **Je-vorm**, korte zinnen, actieve werkwoorden. Knoppen beginnen met een werkwoord: "Start gratis bike fit", "Bewaar in je account".
- **Nederlands eerst**, Engels als tweede taal. Vakwoorden die fietsers gebruiken, blijven Engels: stack, reach, drop, cleat, gravel.
- **Geen** uitroeptekens-reeksen, hypewoorden ("revolutionair", "ultiem") of verzonnen cijfers. Echte claims zijn wel toegestaan: 2.400+ fits, 180+ merken, 4,8 van 380+ rijders. Controleer ze wel op actualiteit.

| Liever | Niet |
|---|---|
| Stel je zadel 4 mm lager en rij er twee ritten mee. | Ervaar direct de ultieme fit! |
| Online geeft een sterke basis; bij blessures helpt een fitter ter plaatse. | Nooit meer pijn, gegarandeerd. |
| Schuif je binnenbeenlengte in. | Voer uw inseam in (cm). |

## Kleuren

| Token | Hex | Rol | Tekst erop |
|---|---|---|---|
| `--bbf-lime` | `#CFF26A` | frisaccent: hero-vlak, resultaat, badges, beeldmerk | alleen inkt |
| `--bbf-lime-zacht` | `#E6F8A8` | geselecteerde optie | inkt |
| `--bbf-petrol` | `#0A7263` | actie: primaire knop, links, schuifvulling, "4U" op licht | wit |
| `--bbf-petrol-hover` | `#075A4E` | hover van petrol | wit |
| `--bbf-petrol-zacht` | `#E1F2EE` | icoonvlak, chip, infoblok, grond in illustraties | inkt of petrol-hover |
| `--bbf-inkt` | `#0F2420` | tekst, donkere secties, sidebar | wit, lime |
| `--bbf-tekst` | `#3B4F4A` | bodytekst | n.v.t. |
| `--bbf-gedempt` | `#4A5F5A` | hints, bijschriften | n.v.t. |
| `--bbf-op-donker` | `#B9CCC6` | subtekst op inkt | n.v.t. |
| `--bbf-rand` | `#DCE6E1` | randen, lege schuifbalk | n.v.t. |
| `--bbf-papier` | `#F5F8F3` | paginagrond | inkt |
| `--bbf-wit` | `#FFFFFF` | kaarten | inkt |
| status | ok `#CFF26A`, let op `#FFD66B`, afwijking `#FFB199` | chips met afwijking | inkt |

Regels:

- Per scherm of uiting is er één dominant accent: lime voor vlakken, petrol voor acties.
- Lime nooit als tekstkleur op licht. Witte tekst alleen op petrol of inkt. Bodytekst minimaal 4.5:1 contrast.
- Geen verlopen en geen extra kleuren. Kleuren die je moet kunnen onderscheiden, verschillen ook in lichtheid.

```css
:root{
  --bbf-lime:#CFF26A; --bbf-lime-zacht:#E6F8A8;
  --bbf-petrol:#0A7263; --bbf-petrol-hover:#075A4E; --bbf-petrol-zacht:#E1F2EE;
  --bbf-inkt:#0F2420; --bbf-tekst:#3B4F4A; --bbf-gedempt:#4A5F5A; --bbf-op-donker:#B9CCC6;
  --bbf-rand:#DCE6E1; --bbf-papier:#F5F8F3; --bbf-wit:#FFFFFF;
  --bbf-font-display:'Bricolage Grotesque',sans-serif;
  --bbf-font-body:Figtree,system-ui,sans-serif;
  --bbf-font-cijfers:'DM Mono',ui-monospace,monospace;
  --bbf-radius-knop:999px; --bbf-radius-kaart:24px; --bbf-radius-paneel:32px; --bbf-radius-veld:14px;
}
```

## Typografie

- **Bricolage Grotesque** 700/800 voor koppen. Hero 88–92 px (letter-spacing −0.035em, line-height 0.95), sectie 52–56 px, kaart 22–28 px.
- **Figtree** 400–700 voor de body: 16–21 px, line-height 1.45–1.55. Knoppen 15–18 px op 700.
- **DM Mono** 500 voor elk getal en elke meetwaarde. Resultaten zijn groot (34–120 px), met de eenheid klein en gedempt ernaast: `742 mm`.
- **Eyebrow** boven secties: 14 px, 700, hoofdletters, letter-spacing 0.08em, in petrol.
- Geen Inter, Roboto of Arial als zichtbare letter.
- Laden via Google Fonts:
  `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@500&family=Figtree:wght@400;500;600;700&display=swap`

## Logo

Het logo bestaat uit het **beeldmerk**, een lime schijf met een lijnfiets in inkt, plus het **woordmerk** "BestBikeFit4U" in Bricolage Grotesque 800. "4U" krijgt de accentkleur: petrol op licht, lime op donker.

| Variant | Wanneer |
|---|---|
| Horizontaal | standaard, headers op licht |
| Horizontaal negatief | op inkt: footer, dashboard-sidebar, social |
| Gestapeld (+ negatief) | vierkante plekken, inlogscherm, profielfoto's |
| Beeldmerk lime / inkt / zwart-wit | app-iconen, avatars, kleine plekken, print en stempels |
| Favicon | vereenvoudigde fiets met dikkere lijnen, onder 32 px |

- **Vrije ruimte** rondom: minstens de halve hoogte van het beeldmerk.
- **Minimaal**: horizontaal 120 px breed, beeldmerk 24 px. Kleiner gebruik je de favicon.
- **Niet doen**: uitrekken, draaien, schaduw of rand toevoegen, opnieuw typen in een ander font, de lime schijf op een lime vlak zetten (gebruik dan het inkt-beeldmerk), of "4U" in een andere kleur.

## Iconen

Lijniconen op een 24-raster, `stroke-width` 2, ronde uiteinden en hoeken, `currentColor`. In een vlak van 52 px met radius 16 in petrol-zacht met petrol icoon, of in lime met inkt icoon voor het uitgelichte item. Geen emoji en geen gevulde iconensets.

## Vorm, ritme en componenten

- **Radius**: knoppen en chips 999px, velden en segmenten 12–16 px, kaarten 20–24 px, grote panelen 28–36 px.
- **Ritme**: desktop 1440 met 120 px zijmarge (marketing) of 64 px (tools). Secties 100–120 px uit elkaar, rasters met gap 20–24 px.
- **Knoppen**: primair is petrol met witte tekst. Secundair heeft een rand van 2 px in inkt. Op lime is de knop inkt met witte tekst. Hoogte 48–60 px, klikdoel minimaal 44 px.
- **Schaduw** spaarzaam, alleen onder zwevende kaarten: `0 18px 40px rgba(15,36,32,.12)`.
- **Invoer**: getallen via schuifregelaars (waarde groot in DM Mono ernaast), keuzes via segmentknoppen of optiekaarten. De uitwerking staat in **website-redesign**.

## Beeld

- Geen stockfoto's. Beeld is een **pentekening in huisstijl**: inktlijnen, arcering in de schaduw en één lime accent dat 5×4 px naast de lijn valt. Zie **bestbikefit4u-illustraties**.
- Geen tekst in beelden; die hoort in de HTML. Formaten 16:10 (hero) en 4:3 (kaarten).

## Middelen maken met `logo_set.py`

**Stap 0, eenmalig**: fonts ophalen, zodat alle tekst naar vormen wordt omgezet.

```bash
pip install --break-system-packages cairosvg fonttools pillow brotli
mkdir -p bbf-huisstijl/fonts && cd bbf-huisstijl
npm pack @fontsource/bricolage-grotesque @fontsource/figtree
for f in fontsource-*.tgz; do mkdir -p "${f%.tgz}" && tar xzf "$f" -C "${f%.tgz}"; done
cp fontsource-bricolage-grotesque-*/package/files/bricolage-grotesque-latin-800-normal.woff fonts/bricolage-800.woff
cp fontsource-figtree-*/package/files/figtree-latin-600-normal.woff fonts/figtree-600.woff
```

Staat `scripts/logo_set.py` er nog niet (bijvoorbeeld als deze skill zonder zip is opgeslagen), schrijf dan de code uit de **Bijlage** letterlijk weg naar `bbf-huisstijl/logo_set.py`.

- **Volledige logoset**, dus alle SVG-varianten, PNG's, `favicon.ico` en `.svg`, app-iconen, `site.webmanifest` en de standaard social-afbeelding:
  `python logo_set.py --fonts fonts --uit dist --zip`
- **Social-afbeelding** (1200×630) voor een pagina of aankondiging:
  `python logo_set.py --fonts fonts --uit dist --alleen-social --kop "Nieuw: cranklengte-calculator" --sub "Gratis en in een minuut klaar" --naam og-cranklengte`
  Een lange kop verdeelt het script automatisch over twee regels of verkleint hem, zodat hij links van de fiets blijft. Houd de kop onder ~35 tekens.

Bekijk elk gemaakt PNG-bestand zelf (Read) voordat je het oplevert.

Snippet voor de `<head>` van de site:

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0F2420">
<meta property="og:image" content="https://bestbikefit4u.eu/og-image-1200x630.png">
```

## Toepassen op andere uitingen

- **E-mail/nieuwsbrief**: witte kaart op papier, horizontaal logo bovenaan, één petrol knop, en cijfers in DM Mono (met fallback naar monospace).
- **Rapport/PDF**: inkt-kopregel met het negatieve logo, resultaattegels met grote DM Mono-cijfers, en een lime blok voor "eerst aanpassen".
- **Presentatie**: inkt- of papierachtergrond, één lime vlak per slide, koppen in Bricolage.
- **Social post**: 1200×630 of 1080×1080. Inkt als grond, lime accent, een pentekening of de grote beeldmerk-fiets.

## Check voor oplevering

- Alleen huisstijlkleuren, één dominant accent, en het contrast in orde?
- Bricolage voor koppen, Figtree voor tekst, DM Mono voor cijfers?
- Het juiste logo voor de achtergrond, met genoeg vrije ruimte en boven de minimale maat?
- Klinkt de tekst concreet en eerlijk, zonder hype of verzonnen cijfers?
- Beelden als pentekening, zonder tekst erin?

## Bijlage: `logo_set.py`

```python
"""logo_set.py - genereert de BestBikeFit4U-logoset en social-afbeeldingen in huisstijl."""
import argparse
import json
import os
import zipfile

import cairosvg
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image

INKT, LIME, PETROL, WIT, PAPIER, GEDEMPT = "#0F2420", "#CFF26A", "#0A7263", "#FFFFFF", "#F5F8F3", "#B9CCC6"
_fonts = {}


def font(pad):
    if pad not in _fonts:
        _fonts[pad] = TTFont(pad)
    return _fonts[pad]


def tekst(s, size, x, baseline, fontpad, tracking=-0.02):
    f = font(fontpad)
    upm, gs, cmap, hmtx = f["head"].unitsPerEm, f.getGlyphSet(), f.getBestCmap(), f["hmtx"]
    sc = size / upm
    pen = SVGPathPen(gs)
    cx = 0.0
    for ch in s:
        g = cmap.get(ord(ch), cmap[ord("?")])
        gs[g].draw(TransformPen(pen, (sc, 0, 0, -sc, x + cx, baseline)))
        cx += hmtx[g][0] * sc + tracking * size
    return pen.getCommands(), cx - tracking * size


def cap(size, fontpad):
    f = font(fontpad)
    return f["OS/2"].sCapHeight / f["head"].unitsPerEm * size


def fiets(stroke, sw=3.6, detail=True, t=(0, 0), s=1.0):
    if detail:
        d = ('<circle cx="17.5" cy="40" r="9.5"/><circle cx="46.5" cy="40" r="9.5"/>'
             '<path d="M17.5 40L25 26.5L31 40Z M25 26.5L42 26.5M31 40L42 26.5L46.5 40"/>'
             '<path d="M21 22.5H29M42 26.5L43 22.5H47"/>')
    else:
        d = ('<circle cx="17" cy="41" r="10"/><circle cx="47" cy="41" r="10"/>'
             '<path d="M17 41L27 24H41L47 41M27 24L33 41"/>')
    return (f'<g transform="translate({t[0]} {t[1]}) scale({s})" fill="none" stroke="{stroke}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{d}</g>')


def merk(x, y, size, schijf=LIME, fg=INKT, detail=True, sw=3.6):
    return (f'<circle cx="{x + size / 2}" cy="{y + size / 2}" r="{size / 2}" fill="{schijf}"/>'
            + fiets(fg, sw, detail, (x, y), size / 64))


def svg(w, h, body, bg=None, titel="BestBikeFit4U"):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'role="img" aria-label="{titel}"><title>{titel}</title>{rect}{body}</svg>')


def woordmerk(x, baseline, size, hoofd, accent, fp):
    d1, w1 = tekst("BestBikeFit", size, x, baseline, fp)
    d2, w2 = tekst("4U", size, x + w1 - 0.01 * size, baseline, fp)
    return f'<path d="{d1}" fill="{hoofd}"/><path d="{d2}" fill="{accent}"/>', w1 + w2


def png(code, pad, w=None, h=None):
    cairosvg.svg2png(bytestring=code.encode(), write_to=pad, output_width=w, output_height=h)


def social(uit, disp, body, kop, sub, naam):
    os.makedirs(uit, exist_ok=True)
    W, H = 1200, 630
    wm, _ = woordmerk(214, 144 + cap(60, disp) / 2, 60, WIT, LIME, disp)
    maxw = 640

    def breedte(s, size):
        return tekst(s, size, 0, 0, disp, tracking=-0.035)[1]

    regels, grootte = [kop], 76
    if breedte(kop, 76) > maxw:
        woorden = kop.split()
        beste = None
        for i in range(1, len(woorden)):
            a, b = " ".join(woorden[:i]), " ".join(woorden[i:])
            w = max(breedte(a, 64), breedte(b, 64))
            if beste is None or w < beste[0]:
                beste = (w, [a, b])
        if beste and beste[0] <= maxw:
            regels, grootte = beste[1], 64
        else:
            grootte = 76
            while grootte > 36 and breedte(kop, grootte) > maxw:
                grootte -= 2
    kd = ""
    if len(regels) == 2:
        for i, r in enumerate(regels):
            kd += tekst(r, grootte, 96, 330 + i * 74, disp, tracking=-0.035)[0]
        sub_y = 460
    else:
        kd = tekst(kop, grootte, 96, 380, disp, tracking=-0.035)[0]
        sub_y = 450
    sd, _ = tekst(sub, 30, 96, sub_y, body, tracking=0) if sub else ("", 0)
    code = svg(W, H, merk(96, 96, 96) + wm + f'<path d="{kd}" fill="{WIT}"/><path d="{sd}" fill="{GEDEMPT}"/>'
               + f'<g opacity="0.9">{fiets(LIME, 3.4, True, (780, 250), 6.2)}</g>'
               + f'<rect x="96" y="500" width="260" height="8" rx="4" fill="{LIME}"/>',
               bg=INKT, titel=f"BestBikeFit4U: {kop}")
    with open(os.path.join(uit, naam + ".svg"), "w") as fh:
        fh.write(code)
    png(code, os.path.join(uit, naam + "-1200x630.png"), W, H)
    return os.path.join(uit, naam + "-1200x630.png")


def logoset(uit, disp):
    for sub in ("svg", "png", "favicon"):
        os.makedirs(os.path.join(uit, sub), exist_ok=True)
    out = {}

    def horizontaal(naam, hoofd, accent, schijf, fg):
        size, ms, gap = 44, 64, 14
        wm, ww = woordmerk(ms + gap, ms / 2 + cap(size, disp) / 2, size, hoofd, accent, disp)
        out[naam] = svg(round(ms + gap + ww + 2), ms, merk(0, 0, ms, schijf, fg) + wm)

    def gestapeld(naam, hoofd, accent, schijf, fg):
        size, ms = 44, 96
        _, ww = woordmerk(0, 0, size, hoofd, accent, disp)
        w = round(max(ww, ms) + 8)
        bl = ms + 20 + cap(size, disp)
        wm, _ = woordmerk((w - ww) / 2, bl, size, hoofd, accent, disp)
        out[naam] = svg(w, round(bl + 4), merk((w - ms) / 2, 0, ms, schijf, fg) + wm)

    horizontaal("logo-horizontaal", INKT, PETROL, LIME, INKT)
    horizontaal("logo-horizontaal-negatief", WIT, LIME, LIME, INKT)
    horizontaal("logo-horizontaal-zwart", INKT, INKT, INKT, WIT)
    horizontaal("logo-horizontaal-wit", WIT, WIT, WIT, INKT)
    gestapeld("logo-gestapeld", INKT, PETROL, LIME, INKT)
    gestapeld("logo-gestapeld-negatief", WIT, LIME, LIME, INKT)
    out["beeldmerk"] = svg(64, 64, merk(0, 0, 64))
    out["beeldmerk-donker"] = svg(64, 64, merk(0, 0, 64, INKT, LIME))
    out["beeldmerk-zwart"] = svg(64, 64, merk(0, 0, 64, INKT, WIT))
    out["favicon"] = svg(64, 64, merk(0, 0, 64, LIME, INKT, detail=False, sw=6.5))
    for naam, code in out.items():
        with open(os.path.join(uit, "svg", naam + ".svg"), "w") as fh:
            fh.write(code)
    for naam in ("logo-horizontaal", "logo-horizontaal-negatief", "logo-gestapeld", "logo-gestapeld-negatief"):
        for w in (480, 960):
            png(out[naam], os.path.join(uit, "png", f"{naam}-{w}.png"), w=w)
    for w in (256, 512, 1024):
        png(out["beeldmerk"], os.path.join(uit, "png", f"beeldmerk-{w}.png"), w, w)

    F = os.path.join(uit, "favicon")
    with open(os.path.join(F, "favicon.svg"), "w") as fh:
        fh.write(out["favicon"])
    for px in (16, 32, 48):
        png(out["favicon"], os.path.join(F, f"favicon-{px}.png"), px, px)
    ims = [Image.open(os.path.join(F, f"favicon-{px}.png")).convert("RGBA") for px in (16, 32, 48)]
    ims[2].save(os.path.join(F, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)], append_images=ims[:2])
    os.remove(os.path.join(F, "favicon-48.png"))

    def vierkant(px, schaal):
        s = px * schaal / 64
        off = (px - 64 * s) / 2
        return svg(px, px, fiets(INKT, 4.6, True, (off, off - 1.5 * s), s), bg=LIME)

    png(vierkant(180, 0.78), os.path.join(F, "apple-touch-icon.png"), 180, 180)
    png(vierkant(192, 0.78), os.path.join(F, "android-chrome-192.png"), 192, 192)
    png(vierkant(512, 0.78), os.path.join(F, "android-chrome-512.png"), 512, 512)
    png(vierkant(512, 0.62), os.path.join(F, "maskable-512.png"), 512, 512)
    manifest = {"name": "BestBikeFit4U", "short_name": "BikeFit4U", "theme_color": INKT,
                "background_color": PAPIER, "display": "standalone",
                "icons": [{"src": "/android-chrome-192.png", "sizes": "192x192", "type": "image/png"},
                          {"src": "/android-chrome-512.png", "sizes": "512x512", "type": "image/png"},
                          {"src": "/maskable-512.png", "sizes": "512x512", "type": "image/png",
                           "purpose": "maskable"}]}
    with open(os.path.join(F, "site.webmanifest"), "w") as fh:
        json.dump(manifest, fh, indent=2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fonts", default="fonts")
    ap.add_argument("--uit", default="dist")
    ap.add_argument("--alleen-social", action="store_true")
    ap.add_argument("--kop", default="Haal meer uit elke rit.")
    ap.add_argument("--sub", default="Online bikefit voor comfort en prestatie")
    ap.add_argument("--naam", default="og-image")
    ap.add_argument("--zip", action="store_true")
    a = ap.parse_args()
    disp = os.path.join(a.fonts, "bricolage-800.woff")
    body = os.path.join(a.fonts, "figtree-600.woff")
    if not a.alleen_social:
        logoset(a.uit, disp)
    print("social:", social(os.path.join(a.uit, "social"), disp, body, a.kop, a.sub, a.naam))
    if a.zip:
        zp = a.uit.rstrip("/") + ".zip"
        with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
            for root, _, files in os.walk(a.uit):
                for fn in sorted(files):
                    full = os.path.join(root, fn)
                    z.write(full, os.path.relpath(full, os.path.dirname(os.path.abspath(a.uit))))
        print("zip:", zp)


if __name__ == "__main__":
    main()
```