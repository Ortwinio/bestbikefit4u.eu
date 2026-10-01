# Schrijfwijzer voor de gidsen van BestBikeFit4U

Versie 1 — 30 september 2026. Geldt voor elke gids onder `/nl/guides/*` en `/en/guides/*`, zowel nieuwe
als herschreven gidsen. Schrijf eerst het Nederlands; de Engelse versie volgt dezelfde opbouw.

## 1. Doel en lezer

Een gids helpt een fietser die een concreet probleem heeft (pijn, ongemak, twijfel over een maat) om
**te begrijpen wat er aan de hand is** en **zelf veilig de eerste stappen te zetten** met zijn afstelling.
De lezer is geen expert: hij kent zijn fiets, maar niet de biomechanica. Hij komt meestal via Google
met een vraag als "knie pijn fietsen voorkant" of "zadelhoogte berekenen".

## 2. Vaste opbouw (in deze volgorde)

| # | Onderdeel | Wat erin staat | Omvang |
|---|---|---|---|
| 0 | **H1 + snel antwoord** | H1 noemt het probleem in de woorden van de lezer. Daaronder 2–3 zinnen met het kernantwoord: de meest waarschijnlijke oorzaak en de eerste stap. | 40–70 woorden |
| 1 | **Het probleem** | Herkenning: welke klachten of symptomen, waar precies, wanneer ze optreden (na hoeveel minuten, bij welk type rit), bij wie het vaak voorkomt. Laat de lezer zich herkennen. | 120–200 woorden |
| 2 | **Achtergrond** | Waarom het ontstaat: in gewone taal de biomechanica, de fit-oorzaken (welke maat, welke richting) en andere oorzaken (training, schoenen, lichaam). Eerlijk over wat online wel en niet te beoordelen is. Een tabel "klacht → waarschijnlijke oorzaak" waar dat helpt. | 200–350 woorden |
| 3 | **Zo pak je het aan met bikefitting** | Concrete tips, genummerd en in volgorde van aanpakken: wat je meet (met wat), wat je aanpast, in welke stappen (mm, graden), hoe je test (2–3 rustige ritten per wijziging, één ding tegelijk), en wanneer je teruggaat. Sluit af met **waarschuwingssignalen**: wanneer je stopt en een fitter of arts inschakelt. Verwijs naar de passende calculator of tool. | 300–500 woorden |
| 4 | **Verder lezen** | 3–5 links naar andere gidsen die logisch volgen (oorzaak, verwante klacht, de maat die je aanpast) plus 1 link naar een calculator. Elke link met één zin waarom. | 60–120 woorden |
| 5 | **Veelgestelde vragen** | 3–5 echte vragen met korte antwoorden (max. 60 woorden). Geen herhaling van de tekst. | 150–300 woorden |
| 6 | **Afsluiter (CTA)** | Eén zin + knop naar de gratis bike fit of de passende calculator. | 1 zin |

Totaal 900–1.500 woorden. Onderdelen 1–4 zijn verplicht; geen extra hoofdstukken ertussen.

## 3. Schrijfstijl (huisstijl)

- **Je-vorm**, korte zinnen (gemiddeld < 18 woorden), actieve werkwoorden. Alinea's van maximaal 4 zinnen.
- **Concreet**: noem getallen en volgorde. "Zet je zadel 3 mm lager en rij er twee ritten mee", niet
  "optimaliseer je zithouding".
- **Eerlijk over grenzen**: online is een sterk startpunt, geen diagnose. Geen schijnprecisie: gebruik
  een marge ("2–5 mm") waar de bron dat doet.
- **Geen hype** ("revolutionair", "gegarandeerd pijnvrij"), geen uitroeptekenreeksen, geen verzonnen cijfers
  of claims. Elk getal komt uit onze engine, een genoemde bron of een algemeen aanvaarde vuistregel.
- **Nederlands eerst.** Vakwoorden die fietsers zelf gebruiken blijven Engels: stack, reach, drop, cleat,
  gravel, setback. Verder alles Nederlands: "zadelhoogte", niet "saddle height"; "gids", niet "guide".
- **Medisch**: noem een klacht, geen ziekte. Bij pijn in rust, 's nachts, zwelling, uitstralende
  tintelingen of pijn die na 3–4 zorgvuldige aanpassingen blijft: verwijs naar een fitter of arts.

## 4. SEO-eisen

| Onderdeel | Eis |
|---|---|
| **Hoofdzoekwoord** | Eén per gids, in de taal van de pagina en zoals mensen zoeken (NL: "knie pijn fietsen", niet een vertaling van de Engelse slug). Plus 2–4 verwante zoekwoorden. |
| **SEO-titel** | Maximaal 60 tekens, hoofdzoekwoord vooraan, eindigt op ` | BestBikeFit4U`. Uniek per gids. |
| **Meta description** | 140–155 tekens: probleem + wat de lezer krijgt + actie. Uniek. Geen afgebroken zin. |
| **H1** | Precies één, bevat het hoofdzoekwoord, mag afwijken van de titel. |
| **Tussenkoppen** | H2 per onderdeel (Het probleem / Achtergrond / Zo pak je het aan / Verder lezen / Veelgestelde vragen); het hoofdzoekwoord of een variant in minstens één H2. |
| **Eerste 100 woorden** | Bevatten het hoofdzoekwoord. |
| **Interne links** | 3–5 gidsen + 1 calculator, met beschrijvende ankertekst (de titel van de doelgids in dezelfde taal, nooit "klik hier" of een Engelse titel op een NL-pagina). Elke gids krijgt ook links vanuit minstens 2 andere gidsen. |
| **Slug** | Niet wijzigen. Moet het toch: 301-redirect via de bestaande redirecttabel. |
| **Gestructureerde data** | `Article` (met `dateModified`), `FAQPage` voor de vragen, `BreadcrumbList`. Waar de aanpak stappen heeft: `HowTo` mag. |
| **Taal** | `hreflang` nl/en en `canonical` per taal; NL- en EN-versie inhoudelijk gelijk. |
| **Afbeelding** | 1 hero-illustratie (zie 5), WebP, 16:10, < 200 kB, beschrijvende alt-tekst NL en EN, ook als `og:image`. |
| **Actualiteit** | Datum "Laatst bijgewerkt" op de pagina en in `dateModified`. |
| **Geen** | Keyword stuffing, dubbele content tussen gidsen, lege of dunne secties, verborgen tekst. |

## 5. Illustraties

- Alleen de huisstijl-pentekening (skill *bestbikefit4u-illustraties*): fineliner op licht mintpapier,
  het belangrijkste onderdeel in lime, maatvoering in petrol, gearceerde schaduwen. Geen foto's, geen
  stockbeeld, **geen tekst in het beeld**.
- Tekenen vanuit code (route B, `pen.py` + `fiets.py`), tenzij Ortwin een eigen foto met rechten aanlevert.
- Het beeld laat **het onderwerp van de gids** zien: de afstelling of het lichaamsdeel waar het om gaat
  (bijv. knie boven het pedaal met maatlijn zadelhoogte; cleat onder de schoen met hoek; stuurdrop).
- Formaat 16:10 (1600 × 1000), bestandsnaam `NN-onderwerp.webp` in `public/illustrations/guides/`.
- Alt-tekst beschrijft wat je ziet en waarom het ertoe doet ("Fietser op racefiets met maatlijn van
  trapas tot zadel: zo meet je zadelhoogte"), NL en EN.

## 6. Checklist per gids (voor schrijver en controleur)

- [ ] Opbouw 0–6 in de juiste volgorde, onderdelen 1–4 aanwezig en op lengte.
- [ ] Het probleem is herkenbaar beschreven; de achtergrond legt het *waarom* uit.
- [ ] Tips zijn concreet (maat, richting, stapgrootte, testduur) en genummerd; waarschuwingssignalen staan erin.
- [ ] 3–5 gidslinks + 1 calculator, met NL-titels en een zin waarom.
- [ ] Titel ≤ 60, description 140–155, één H1, zoekwoord in H1/eerste 100 woorden/een H2.
- [ ] Geen Engelse woorden buiten de toegestane vakwoorden; je-vorm; geen hype of verzonnen cijfers.
- [ ] Structured data, hreflang, canonical, dateModified kloppen.
- [ ] Hero-illustratie in huisstijl, 16:10, < 200 kB, alt-tekst NL/EN.
- [ ] NL en EN inhoudelijk gelijk.
