# Route-map — BestBikeFit4U redesign

**70 non-admin `page.tsx`-bestanden**, gecontroleerd op 29 september 2026.

Reproduceerbaar met: `find src/app -name page.tsx | grep -v admin | wc -l`.

## Leeswijzer en bronnen

- De Route-kolom inventariseert de interne paden uit `src/app`, zonder routegroepen. Elke bronroute staat precies eenmaal in die kolom; drie paren zijn samengevoegd, dus er zijn 67 tabelrijen. Dynamische slugs tellen als één bronroute, niet als afzonderlijke gepubliceerde pagina's.
- Publieke bronbestanden staan onder `src/app/(public)/<route>/page.tsx`; accountbestanden onder `src/app/(dashboard)/<route>/page.tsx`. Uitzonderingen: home is `src/app/(public)/page.tsx`, login is `src/app/(auth)/login/page.tsx`, app-installatie is `src/app/app/page.tsx`.
- Normale bezoekers-URL's krijgen `/nl` of `/en`. `src/i18n/proxyDecision.ts:43` stuurt ongeprefixte paden door naar de voorkeurstaal; `src/proxy.ts:170` herschrijft de taal-URL intern. Taalvarianten krijgen dezelfde board, geen dubbele inventarisregels. `src/i18n/metadata.ts:24` bepaalt normaal een canonical per taal.
- `next.config.ts` bevat **geen redirects of rewrites**. Aliasgedrag hieronder komt uit de pagina's en proxy. Databasegestuurde gidsredirects bestaan via `src/proxy.ts:88`; de actuele records zijn geen onderdeel van deze statische broncode-audit.
- Bestaande bestandsnamen verwijzen naar `plans/redesign-canvas/canvas/`; voorgestelde nieuwe namen zijn toekomstige bestanden onder `plans/redesign-canvas/drafts/`. Alleen deze audit wordt geschreven. Een bestaande board betekent inhoudelijke dekking van het paginatype, geen goedgekeurde implementatiepariteit.
- Canvasrijen: **Pagina's** voor marketing en SEO/content, **Configurators** voor openbare tools, **Achter de login** voor auth/account. De rij staat bij iedere regel in Notes. Huidige ankers zijn respectievelijk `y=0`, `y=0` vanaf `x=3040`, en `y=4720` in `canvas/canvas.json`; uitbreiding vraagt later om layout door de lead. De merkrij (`y=6320`) bevat `Logo.dc.html` en `Illustraties.dc.html`, zonder eigen paginaroutes.
- P1 = huidige hoofdnavigatie/sidebar of kernconversie; P2 = ondersteunend; P3 = long tail/legacy. Navigatiebewijs: `src/components/layout/Header.tsx:30` en `src/components/layout/DashboardSidebar.tsx:50`. De voorgestelde bouwvolgorde volgt daarnaast de afgesproken fases.

## Public marketing

| Route | What the page does (1 line, from the code) | Canvas board (existing file or MISSING) | Proposed board file | Priority (P1/P2/P3) | Notes |
|---|---|---|---|---|---|
| `/` | Introduceert de fitdienst met tools, stappen, fietsen, bewijs en gidsen. | `Main.dc.html` | `Main.dc.html` | P1 | Rij: Pagina's. Locale-home is canonical; verifieer voorbeeldclaims en navigatielinks bij uitwerking. |
| `/pricing` | Vergelijkt zichtbare plannen, mogelijkheden en beschikbaarheid van betalingen. | `Pricing.dc.html` | `Pricing.dc.html` | P1 | Rij: Pagina's. Board bestaat, maar commerciële inhoud moet op huidige configuratie aansluiten; betalingen zijn gepauzeerd. |
| `/how-it-works` | Legt de stappen van meten naar fitadvies en vervolgstappen uit. | MISSING | `HowItWorks.dc.html` | P1 | Rij: Pagina's. Home heeft slechts een stappenblok, geen volledige routeboard; headerlink. |
| `/about` | Licht de methodiek, biomechanische uitgangspunten en fitcomponenten toe. | MISSING | `About.dc.html` | P2 | Rij: Pagina's. Eigen canonical; inhoud overlapt deels met methode-artikelen. |
| `/faq` | Beantwoordt veelgestelde vragen over dienst, metingen en gebruik. | MISSING | `FAQ.dc.html` | P2 | Rij: Pagina's. Eén gelokaliseerde FAQ-template. |
| `/contact` | Geeft de e-mailroute naar support en verwachtingen voor hulp. | MISSING | `Contact.dc.html` | P2 | Rij: Pagina's. De huidige route is mailto-gebaseerd, geen contactformulier verzinnen. |
| `/fit-pass` | Presenteert de Fit Pass en bijbehorende toegang tot fiets-, sessie- en rapportfuncties. | MISSING | `FitPass.dc.html` | P1 | Rij: Pagina's. Specifieke conversielanding; geen alias van pricing. Behoud de betaalpauze in CTA-staten. |
| `/case-study` | Werft deelnemers voor een bikefit-casestudy via een aanmeldformulier. | MISSING | `CaseStudy.dc.html` | P2 | Rij: Pagina's. Recruitment, geen gepubliceerde succesverhalen-template; `CaseStudyRecruitmentForm` behouden. |

## Public calculators

| Route | What the page does (1 line, from the code) | Canvas board (existing file or MISSING) | Proposed board file | Priority (P1/P2/P3) | Notes |
|---|---|---|---|---|---|
| `/calculators/bike-fit` | Berekent een eerste fitadvies uit lichaamsmaten en rijcontext. | `BikeFit.dc.html` | `BikeFit.dc.html` | P1 | Rij: Configurators. Hoofdconversie; publieke intake is niet de accountvragenlijst. Enginepariteit hoort bij audit 02. |
| `/calculators/saddle-height` | Berekent een startwaarde voor zadelhoogte en geeft afstelinstructies. | `SaddleHeight.dc.html` | `SaddleHeight.dc.html` | P1 | Rij: Configurators. Uitgelichte instaptool naar de fitflow. |
| `/calculators/frame-size` | Adviseert een eerste framemaat op basis van lichaamsmaten en fietstype. | `FrameSize.dc.html` | `FrameSize.dc.html` | P1 | Rij: Configurators. Uitgelichte instaptool; maatadvies is geen fietsdetailpagina. |
| `/tire-pressure-calculator`<br>`/bandenspanning-calculator` | Toont dezelfde drukcalculator voor voor- en achterband, met uitleg en FAQ. | `TirePressure.dc.html` | `TirePressure.dc.html` | P1 | Rij: Configurators. Twee bronbestanden, één tool. Canonical EN: `/en/tire-pressure-calculator`; NL: `/nl/bandenspanning-calculator`. Verkeerde taal/pad-combinaties krijgen `permanentRedirect` (308); zie beide pagina's en `src/lib/public-calculators/routes.ts:89`. |
| `/calculators/gearing` | Berekent verzet en helpt de geschiktheid voor klimmen beoordelen. | MISSING | `Gearing.dc.html` | P2 | Rij: Configurators. Werkende `GearingCalculatorForm`; accountvariant heeft een eigen omhulling. |
| `/calculators/crank-length` | Geeft cranklengteadvies met optionele vooraf ingevulde binnenbeenlengte en fietscategorie. | MISSING | `CrankLength.dc.html` | P2 | Rij: Configurators. Queryparameters zijn toestanden, geen extra routes. |
| `/calculators/saddle-width` | Berekent een zadelbreedteadvies uit de invoer van de zadelbreedte-tool. | MISSING | `SaddleWidth.dc.html` | P2 | Rij: Configurators. Niet gelijkstellen aan de uitgebreidere account-zadelselector. |
| `/calculators/ftp-wkg` | Legt FTP en W/kg uit met gebruiksstappen, FAQ en account-CTA. | MISSING | `FtpWkg.dc.html` | P2 | Rij: Configurators. Momenteel een statische informatiepagina, zonder calculatorformulier of live uitkomst; interactieve uitbreiding vraagt een expliciet rekencontract. |
| `/calculators/power-speed` | Legt de relatie tussen vermogen, snelheid en parcours uit met vervolglinks. | MISSING | `PowerSpeed.dc.html` | P2 | Rij: Configurators. Huidige pagina heeft geen werkende estimator; formule niet als bestaande engine claimen. |
| `/calculators/fuel-hydration` | Geeft uitleg over voedings- en hydratatieplanning met FAQ en account-CTA. | MISSING | `FuelHydration.dc.html` | P2 | Rij: Configurators. Huidige pagina heeft geen interactief plannerformulier; nieuw gedrag apart afstemmen. |
| `/calculators/climb-planner` | Beschrijft klimvoorbereiding, pacing en voeding met vervolgstappen. | MISSING | `ClimbPlanner.dc.html` | P2 | Rij: Configurators. Huidige pagina is informatief, niet een live klimplanner; niet verwarren met de verzetcalculator. |

## SEO/content

| Route | What the page does (1 line, from the code) | Canvas board (existing file or MISSING) | Proposed board file | Priority (P1/P2/P3) | Notes |
|---|---|---|---|---|---|
| `/bike-fitting`<br>`/bikefitting` | Geeft respectievelijk EN- en NL-instapinformatie over thuis bikefitten. | MISSING | `BikeFittingLanding.dc.html` | P2 | Rij: Pagina's. Eén voorgestelde template, twee bronroutes. Canonicals zijn `/en/bike-fitting` en `/nl/bikefitting`; de andere taal geeft 404, geen onderlinge redirect. Bewijs: beide pagina's regels 16–17 en 89–94. |
| `/fiets-afstellen` | Begeleidt het afstellen van de fiets met stappen, gereedschap en tool-CTA's. | MISSING | `BikeSetup.dc.html` | P2 | Rij: Pagina's. Bestaande NL én EN-inhoud op hetzelfde pad; geen ingestelde alias van de bikefitting-landings. |
| `/why-bikefit-matters` | Legt voordelen, klachten, afstellingen en grenzen van bikefit uit. | MISSING | `WhyBikeFit.dc.html` | P2 | Rij: Pagina's. Volledige uitlegpagina; home-fragmenten zijn geen volledige boarddekking. |
| `/measurement-guide` | Instrueert hoe verplichte en optionele lichaamsmetingen worden uitgevoerd. | MISSING | `MeasurementGuide.dc.html` | P1 | Rij: Pagina's. Ondersteunt direct de meet- en fitconversie; afzonderlijk van de accountwizard. |
| `/pain` | Biedt een overzicht van veelvoorkomende klachten en gerichte fit-ingangen. | MISSING | `PainIndex.dc.html` | P2 | Rij: Pagina's. Home heeft klachtkaarten, maar de index ontbreekt als board. |
| `/pain/[slug]` | Rendert klachtgerichte uitleg en vervolgstappen via `PainPointPageTemplate`. | MISSING | `PainDetail.dc.html` | P2 | Rij: Pagina's. Eén board/template voor alle ondersteunde slugs; onbekende slug geeft 404. |
| `/guides` | Bundelt gidscategorieën, onderliggende gidsen en gerelateerde blogartikelen. | MISSING | `Guides.dc.html` | P2 | Rij: Pagina's. Canonicale bestemming van de legacy use-cases-index; canvasheader heeft al een Gidsen-link die nog naar home wijst. |
| `/guides/[slug]` | Rendert een gidshub of artikel met inhoud, FAQ, gerelateerde links en CTA's. | MISSING | `GuideDetail.dc.html` | P2 | Rij: Pagina's. Eén board met hub- én artikelvariant voor alle slugs; behoud previewstaat. Canonical kan via CMS worden overschreven (`page.tsx:196`); redirects kunnen databasegestuurd zijn. |
| `/use-cases` | Stuurt door naar de gelokaliseerde gidsenindex. | MISSING | `Guides.dc.html` | P3 | Rij: Pagina's, via bestemming. `redirect` (307), geen eigen scherm bouwen; gedeelde canonical-bestemming met gidsenindex. |
| `/use-cases/[slug]` | Stuurt legacy scenario's door naar hun gids of de ride-types-hub. | MISSING | `GuideDetail.dc.html` | P3 | Rij: Pagina's, via bestemming. `redirect` (307); zeven mappings in `src/lib/guides/redirects.ts:1`, fallback is de ride-types-gids. Geen eigen board. |
| `/blog` | Toont gepubliceerde artikelen met categorie-filter en paginering. | MISSING | `BlogIndex.dc.html` | P2 | Rij: Pagina's. Filter/page-queryparameters zijn toestanden binnen dezelfde board. |
| `/blog/[slug]` | Toont een gepubliceerd artikel met afbeelding, leestijd, inhoudsopgave en gerelateerde inhoud. | MISSING | `BlogArticle.dc.html` | P2 | Rij: Pagina's. Eén artikeltemplate; onbekende slug geeft 404; CMS-canonical kan locale-default overrulen (`page.tsx:80`). |
| `/science/bike-fit-methods` | Vergelijkt bikefitmethodes en beschrijft toepassingsgebied en beperkingen. | MISSING | `ScienceArticle.dc.html` | P2 | Rij: Pagina's. Deel één wetenschappelijke artikeltemplate met de twee andere science-routes; behoud inhoud per route. |
| `/science/calculation-engine` | Legt invoer, grenzen en uitkomsten van de berekeningsengine uit. | MISSING | `ScienceArticle.dc.html` | P2 | Rij: Pagina's. Variant van dezelfde science-template; geen alias of redirect. |
| `/science/stack-and-reach` | Legt stack, reach en het vergelijken van framegeometrie uit. | MISSING | `ScienceArticle.dc.html` | P2 | Rij: Pagina's. Variant van dezelfde science-template; eigen canonical. |
| `/privacy` | Publiceert het privacybeleid in secties met actualisatiedatum. | MISSING | `Legal.dc.html` | P2 | Rij: Pagina's. Eén juridische template met afzonderlijke privacy- en voorwaardeninhoud. |
| `/terms` | Publiceert gebruiksvoorwaarden en beperkingen van de dienst. | MISSING | `Legal.dc.html` | P2 | Rij: Pagina's. Hergebruik juridische template; niet de URL's of juridische teksten samenvoegen. |
| `/bandenspanning/racefiets` | Toont de drukcalculator met road als standaarddiscipline en specifieke introductie. | `TirePressure.dc.html` | `TirePressure.dc.html` | P3 | Rij: Configurators. Gedeelde toolboard met SEO-introvariant; eigen locale-canonical, geen redirect. |
| `/bandenspanning/gravelbike` | Toont de drukcalculator met gravel als standaarddiscipline en specifieke introductie. | `TirePressure.dc.html` | `TirePressure.dc.html` | P3 | Rij: Configurators. Zelfde template, gravelvariant; eigen locale-canonical. |
| `/bandenspanning/mtb` | Toont de drukcalculator met MTB als standaarddiscipline en specifieke introductie. | `TirePressure.dc.html` | `TirePressure.dc.html` | P3 | Rij: Configurators. Zelfde template, MTB-variant; eigen locale-canonical. |
| `/tire-pressure/[slug]`<br>`/bandenspanning/[slug]` | Publiceert berekende bandendruk voor gewicht/fietstype met tubeless-binnenbandvergelijking. | MISSING | `PressureLanding.dc.html` | P3 | Rij: Pagina's. Twee bronroutes, één statische resultaattemplate. Canonicals zijn EN tire-pressure en NL bandenspanning met vertaalde slugs (`src/lib/seo/programmatic/tirePressure.ts:145`). Pagina's forceren inhoudstaal, zonder verkeerde-locale-redirect. Onbekende slug geeft 404; de drie vaste disciplinepaden winnen van de dynamische route. |

## Auth

| Route | What the page does (1 line, from the code) | Canvas board (existing file or MISSING) | Proposed board file | Priority (P1/P2/P3) | Notes |
|---|---|---|---|---|---|
| `/login` | Meldt aan via e-mailcode of Google en leidt na succes naar de accountflow. | `Login.dc.html` | `Login.dc.html` | P1 | Rij: Achter de login. Bestaande board moet aangepast: die vraagt een wachtwoord (`Login.dc.html:71`), terwijl de pagina Resend-codeverificatie gebruikt (`page.tsx:402`). Login/aanmaken zijn toestanden, geen aparte bronroutes. |

## Dashboard/account

| Route | What the page does (1 line, from the code) | Canvas board (existing file or MISSING) | Proposed board file | Priority (P1/P2/P3) | Notes |
|---|---|---|---|---|---|
| `/dashboard` | Vat profielvoortgang, fiets-/fitinformatie en relevante vervolgstappen samen. | `Dashboard.dc.html` | `Dashboard.dc.html` | P1 | Rij: Achter de login. Sidebar-hoofdscherm; canvas-Lisa en fietsdata zijn voorbeelden, geen echte accountgegevens. |
| `/profile` | Beheert lichaamsmaten, fysieke eigenschappen en rijcontext via wizard en profielsecties. | MISSING | `Profile.dc.html` | P1 | Rij: Achter de login. Ontwerp eerste invulling én bewerken; publieke bikefitboard dekt deze opgeslagen profielstaat niet. |
| `/profile/improve/body-measurements` | Geeft meetinstructies binnen de profielverbeterflow. | MISSING | `ProfileImprove.dc.html` | P2 | Rij: Achter de login. Eén template voor vier `ProfileImproveGuideClient`-varianten; terugkeer naar profiel behouden. |
| `/profile/improve/flexibility` | Begeleidt het verbeteren/beoordelen van flexibiliteit voor het fysieke profiel. | MISSING | `ProfileImprove.dc.html` | P2 | Rij: Achter de login. Flexibiliteitsvariant van de gedeelde verbeter-template. |
| `/profile/improve/core-stability` | Begeleidt het verbeteren/beoordelen van rompstabiliteit voor het fysieke profiel. | MISSING | `ProfileImprove.dc.html` | P2 | Rij: Achter de login. Core-variant van dezelfde template. |
| `/profile/improve/comfort` | Geeft comfortgerichte begeleiding binnen profielverbetering. | MISSING | `ProfileImprove.dc.html` | P2 | Rij: Achter de login. Comfortvariant van dezelfde template. |
| `/bikes` | Toont opgeslagen fietsen en acties om een fiets te openen of toe te voegen. | MISSING | `Bikes.dc.html` | P1 | Rij: Achter de login. Fietskaarten op dashboard en één fietsdetailboard vervangen de garage-index niet. |
| `/bikes/new` | Laat kiezen tussen handmatig toevoegen, Marktplaats-import en paspoort-import. | MISSING | `BikeAdd.dc.html` | P1 | Rij: Achter de login. Sidebarlink en kernflow; dit is een keuzescherm, niet het invoerformulier. |
| `/bikes/new/manual` | Maakt een fiets aan via `CreateBikeForm`. | MISSING | `BikeForm.dc.html` | P1 | Rij: Achter de login. Deel één formulierboard met de bewerkroute, met duidelijke aanmaakstaat. |
| `/bikes/import/marktplaats` | Voert een Marktplaats-fietsimport uit via `MarktplaatsBikeImportFlow`. | MISSING | `BikeImportMarktplaats.dc.html` | P2 | Rij: Achter de login. Apart importpad met eigen beoordeling/foutstaten. |
| `/bikes/import/passport` | Importeert een fietspaspoort via `BikePassportImportFlow`. | MISSING | `BikeImportPassport.dc.html` | P2 | Rij: Achter de login. Andere invoer en bevestiging dan Marktplaats; geen alias. |
| `/bikes/[bikeId]` | Toont fietsidentiteit, geometrie, fitcontext en relevante fiets-/rapportacties. | `BikeProfile.dc.html` | `BikeProfile.dc.html` | P1 | Rij: Achter de login. Gedeeltelijke dekking: canvas heeft nu/doel en afstelplan; identiteit, paspoort en overige echte detailfuncties nog uitlijnen. Eén template voor alle fietsen. |
| `/bikes/[bikeId]/edit` | Bewerkt een bestaande fiets met vooraf ingevulde `BikeForm`. | MISSING | `BikeForm.dc.html` | P1 | Rij: Achter de login. Bewerkvariant van handmatig toevoegen; behoud fiets-ID, validatie en opslaan/annuleren. |
| `/bikes/compare-fit` | Geeft uitleg en aandachtspunten voor het vergelijken van twee fietsen op fit. | MISSING | `BikeCompare.dc.html` | P2 | Rij: Achter de login. Nu een informatieve pagina, geen werkende vergelijkingstool. CTA gebruikt een niet-bestaand dashboard/bikes-pad; zie bevindingen. |
| `/fit` | Selecteert fiets en sessiecontext en start een nieuwe fitsessie. | MISSING | `FitStart.dc.html` | P1 | Rij: Achter de login. Sidebar/kernflow; `BikeFit.dc.html` is uitsluitend de openbare calculator. |
| `/fit/[sessionId]/questionnaire` | Laadt vragen, bewaart antwoorden en voltooit de intake richting resultaten. | MISSING | `FitQuestionnaire.dc.html` | P1 | Rij: Achter de login. Eén sessietemplate met voortgang en laad-/ontbrekende-sessiestaten. |
| `/fit/[sessionId]/results` | Toont het persoonlijke fitrapport, aanbevelingen en rapport-/toegangsacties. | MISSING | `FitResults.dc.html` | P1 | Rij: Achter de login. PDF/e-mail en toegangsvarianten horen hier; rapportteasers op andere boards zijn geen volledig resultaatontwerp. |
| `/fit/how-it-works` | Legt accountinvoer, berekeningsstappen en geadviseerde fitmaten uit. | MISSING | `FitMethod.dc.html` | P2 | Rij: Achter de login. Ondersteunende methodepagina in dashboardcontext; geen alias van de openbare procesuitleg. |
| `/fit-history` | Groepeert eerdere fitsessies en aanbevelingen per fiets. | `History.dc.html` | `History.dc.html` | P1 | Rij: Achter de login. Board bestaat; huidige code gebruikt `BikeWithFitHistory`, canvasgrafieken en comforttrends vragen aparte datavalidatie. |
| `/pressure-calculator` | Toont de opgeslagen/accountdrukcalculator, eventueel vooraf gericht op een fiets. | MISSING | `PressureDashboard.dc.html` | P1 | Rij: Achter de login. Publieke `TirePressure.dc.html` is alleen componentreferentie; fietskeuze/accountstaat ontbreken daarin. Ondanks `legacyAliases` in het openbare register is dit een echte accountpagina, geen redirect. |
| `/gearing` | Toont de verzetcalculator in dashboardcontext. | MISSING | `GearingDashboard.dc.html` | P1 | Rij: Achter de login. Sidebarlink; deelt `GearingCalculatorForm` met de openbare pagina, maar vraagt eigen accountomhulling. |
| `/saddle-selector` | Toont de account-zadelselector via `SaddleSelectorForm`. | MISSING | `SaddleSelector.dc.html` | P1 | Rij: Achter de login. Sidebarlink; niet afgedekt door alleen een openbare zadelbreedteboard. |
| `/shoe-cleat-fit` | Geeft informatie over voetvorm, schoenkeuze en cleatpositie met fit-CTA. | MISSING | `ShoeCleatFit.dc.html` | P2 | Rij: Achter de login. Nu geen werkende cleatwizard; CTA gebruikt een niet-bestaand dashboard/fit-pad. |
| `/settings` | Beheert accountweergave, voorkeuren, integraties en abonnements-/appinformatie. | MISSING | `Settings.dc.html` | P1 | Rij: Achter de login. Sidebarlink; onder meer Strava-statussen en betaalpauze meenemen. |
| `/feedback` | Opent de feedbackhub voor gebruikersfeedback en bijbehorende overzichten. | MISSING | `Feedback.dc.html` | P1 | Rij: Achter de login. Sidebarlink; route rendert `FeedbackHubPage`. |
| `/app` | Geeft installatie-instructies en stuurt in standalone-modus naar dashboard of login. | MISSING | `AppInstall.dc.html` | P2 | Rij: Achter de login als ontwerpcontext; technisch buiten de dashboardgroep en ook zonder login bereikbaar. `src/app/app/page.tsx:50` bevat de conditionele clientredirect. Geen onvoorwaardelijke alias. |

## Summary

### Tellingen

| Groep | Bronroutes / page.tsx | Tabelrijen | Routes met bestaande board | Routes met MISSING |
|---|---:|---:|---:|---:|
| Public marketing | 8 | 8 | 2 | 6 |
| Public calculators | 12 | 11 | 5 | 7 |
| SEO/content | 23 | 21 | 3 | 20 |
| Auth | 1 | 1 | 1 | 0 |
| Dashboard/account | 26 | 26 | 3 | 23 |
| **Totaal** | **70** | **67** | **14** | **56** |

Er zijn **45 unieke MISSING-boardnamen** voor deze 56 bronroutes. Gedeelde templates en redirectbestemmingen verklaren het verschil. De snapshot bevat 12 boards: 10 routegerelateerde boards en 2 merkboards. De 14 gedekte bronroutes bevatten gedeelde drukcalculatorvarianten; bestaande boards vragen nog QA, zoals hierboven aangegeven.

### MISSING-boards in voorgestelde bouwvolgorde

De zeven openbare tools volgen fase 2, daarna de accountflow van fase 3 en de content/marketingtemplates van fase 4. Binnen een fase gaat de kernflow voor ondersteuning. Een P1-contentpagina blijft dus belangrijk, ook als de afgesproken fasevolgorde haar later plant.

1. `Gearing.dc.html`
2. `CrankLength.dc.html`
3. `SaddleWidth.dc.html`
4. `FtpWkg.dc.html` — eerst vaststellen welk rekencontract beschikbaar is.
5. `PowerSpeed.dc.html` — idem.
6. `FuelHydration.dc.html` — idem.
7. `ClimbPlanner.dc.html` — idem.
8. `Profile.dc.html`
9. `Bikes.dc.html`
10. `BikeAdd.dc.html`
11. `BikeForm.dc.html` — aanmaken en bewerken.
12. `FitStart.dc.html`
13. `FitQuestionnaire.dc.html`
14. `FitResults.dc.html`
15. `PressureDashboard.dc.html`
16. `GearingDashboard.dc.html`
17. `SaddleSelector.dc.html`
18. `Settings.dc.html`
19. `Feedback.dc.html`
20. `BikeImportMarktplaats.dc.html`
21. `BikeImportPassport.dc.html`
22. `ProfileImprove.dc.html` — vier inhoudsvarianten.
23. `FitMethod.dc.html`
24. `AppInstall.dc.html`
25. `BikeCompare.dc.html`
26. `ShoeCleatFit.dc.html`
27. `HowItWorks.dc.html`
28. `MeasurementGuide.dc.html`
29. `FitPass.dc.html`
30. `PainIndex.dc.html`
31. `PainDetail.dc.html`
32. `Guides.dc.html` — ook bestemming van de legacy index.
33. `GuideDetail.dc.html` — hub/artikel en legacy detailbestemmingen.
34. `BikeFittingLanding.dc.html` — EN/NL-paden delen het ontwerp.
35. `BikeSetup.dc.html`
36. `WhyBikeFit.dc.html`
37. `About.dc.html`
38. `FAQ.dc.html`
39. `Contact.dc.html`
40. `CaseStudy.dc.html`
41. `BlogIndex.dc.html`
42. `BlogArticle.dc.html`
43. `ScienceArticle.dc.html` — drie inhoudsvarianten.
44. `Legal.dc.html` — privacy en voorwaarden.
45. `PressureLanding.dc.html` — EN/NL gewicht/fietstypevarianten.

### Samenvoegen, behouden en aandachtspunten

- **Geen afzonderlijke use-cases-schermen bouwen.** Beide legacy routes sturen al naar gidsen door. Behoud de redirects voor bestaande links; verwijder geen bronroute zonder migratiebesluit.
- **Deel het ontwerp van de twee bikefitting-landings, behoud de locale-URL's.** Ze zijn nu afzonderlijke canonicals met een locale-404, geen aliaspaar met één globale canonical. Een taalwissel moet naar het passende pad wijzen.
- **Deel drukcalculatorcomponenten, behoud de verschillende paginadoelen.** De twee openbare taalpaden delen één board; de drie discipline-landings delen die template met een preset. De statische gewicht/fietstypepagina's en de opgeslagen accounttool hebben andere inhoud/toestanden en blijven afzonderlijke templates. De metadata van de openbare drukcalculator gebruikt momenteel dezelfde padnaam voor beide hreflang-talen; controleer dit bij latere implementatie tegen de echte taalpaden.
- **Overweeg redactionele consolidatie van methodiekuitleg.** About, openbare procesuitleg en science overlappen, maar hebben nu eigen inhoud en canonicals. Deel componenten/broninhoud; bepaal pas na inhouds- en SEO-review of een URL verdwijnt. De accountmethodepagina houdt haar dashboardcontext.
- **Behoud Fit Pass als afzonderlijke campagne-/productlanding zolang de huidige flow ernaar verwijst.** Hergebruik prijscomponenten; geen extra checkout of nieuwe betaalflow binnen dit redesign.
- **Maak geen nieuwe functionaliteit uit marketingtekst.** FTP/Wkg, power/speed, fuel/hydration en climb-planner renderen momenteel uitleg en CTA's, geen live calculator. De fietsvergelijking en schoen/cleatpagina zijn eveneens informatief. Nieuwe interactieve versies vereisen echte invoer-/uitvoercontracten en leadbesluit; audit 01 autoriseert geen enginewijziging.
- **Herstel later de twee foutieve account-CTA's.** De vergelijkpagina linkt naar `/dashboard/bikes` en de schoen/cleatpagina naar `/dashboard/fit`, waarvoor geen `page.tsx` bestaat en `next.config.ts` geen alias definieert. De werkelijke garage- en nieuwe-fit-routes staan in de accounttabel. Dit zijn geen extra inventarisroutes en er is nu geen appcode aangepast.
- **Aanvullende deliverables buiten de routecount:** het PDF-rapport is een export, geen `page.tsx`; ontwerp het apart bij de resultatenflow. Mobiele varianten en laad-/fout-/lege toestanden zijn varianten van bovenstaande boards. Login moet e-mailcodestaten krijgen; pricing/rapport-CTA's moeten de betaalpauze respecteren. Voorbeelddata en niet-geverifieerde canvasclaims blijven zichtbaar als voorbeelden/placeholders.
- **Paletstatus:** deze route-audit doet geen nieuwe paletkeuze. `reference/design-language.md` en de snapshot gebruiken lime/petrol; expliciete goedkeuring van het palet blijft bij de lead en de fase-1-gate.

Validatie: de Route-kolom is als verzameling vergeleken met alle 70 non-admin paginabestanden; ontbrekend 0, extra 0, dubbel 0. Alleen dit outputbestand is door Codex A geschreven; geen appwijzigingen, canvaspublicatie, Sfora-write of commit.
