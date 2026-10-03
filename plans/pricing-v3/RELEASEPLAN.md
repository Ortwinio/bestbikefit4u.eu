# Releaseplan prijsmodel v2

Oct 3, 2026 · @Ortwin

## Samenvatting

We zetten het nieuwe prijsmodel live in twee stappen: release 2.0 (betalen live, circa 5 weken) en release 2.1 (cadeaus en groeimails, circa 2 weken daarna). Uitgangspunt is de [pricingstrategie](https://claude.ai/code/artifact/eba3cb6f-b009-405d-a9e9-0c4644c4d7a6); het technische plan staat in `plans/feature-pricing-model-v2/`.

**Waarom twee stappen:** Stripe aanzetten is het grootste risico en levert de eerste echte data over de prijzen. Door eerst alleen de betaalstroom, de afscherming en de prijspagina live te zetten, valideren we sneller en houden we de release klein genoeg om goed te testen. Cadeaus en groeimails bouwen daarop voort.

**Livegang mag pas als:** Stripe in testmodus volledig werkt, de voorwaarden juridisch zijn getoetst, en een echte betaling in productie is gelukt en terugbetaald.

De weekschattingen gaan uit van één ontwikkelaar met ondersteuning van Claude-agents. Ze zijn een eerste inschatting en worden na week 1 bijgesteld.

**Prijzen in deze release** (bijgewerkt 3 oktober 2026). Het jaarabonnement is de hoofdkeuze: op de prijspagina en in de betaalstroom staan de drie prijzen naast elkaar, met het jaar in het midden als opvallendste kaart en het label "Favoriete keuze".

| Product | Prijs incl. btw | Inhoud |
| --- | --- | --- |
| Gratis account | €0 | Kernwaarden, profiel tot 80%, 1 fiets |
| Losse meting | €13,50 eenmalig | Volledig stappenplan voor 1 fiets, 3 maanden |
| Jaarabonnement (favoriete keuze) | €24,50 eerste jaar, daarna €19,50 | 12 maanden optimaliseren, alle fietsen, 2 losse metingen om weg te geven |
| Instap na losse meting of cadeau | €13,50 eerste jaar, daarna €19,50 | Als jaarabonnement, 1 cadeau in het eerste jaar |
| Jaarabonnement + persoonlijke bikefit | €234,50 eerste jaar, daarna €19,50 | Jaarabonnement plus 1 persoonlijke bikefit-afspraak; daarna verlengt het als gewoon jaarabonnement |
| Cadeaumeting | t.w.v. €13,50 | Als losse meting, 1 maand om te verzilveren |

Aannames die nog bevestigd moeten worden: de instap en de cadeauwaarde volgen de nieuwe prijs van de losse meting (€13,50), en de persoonlijke bikefit verlengt na het eerste jaar als jaarabonnement voor €19,50.

## Scope

Release 2.0 bevat alles wat nodig is om eerlijk geld te vragen; 2.1 voegt de groeimotor toe.

| Onderdeel | 2.0 | 2.1 | Later |
| --- | --- | --- | --- |
| Producten en rechtenmodel (per gebruiker en per fiets) | ✓ |  |  |
| Losse meting €13,50 via Stripe | ✓ |  |  |
| Jaarabonnement €24,50, verlenging €19,50, label "Favoriete keuze" | ✓ |  |  |
| Jaarabonnement + persoonlijke bikefit €234,50, afspraak plannen via agendalink | ✓ |  |  |
| Instap €13,50 na losse meting | ✓ |  |  |
| Opzegknop, restitutie naar rato, afstandsrecht-vinkje | ✓ |  |  |
| Afleidingsvrije betaalstroom (kies, account, bevestig, gelukt, mislukt) | ✓ |  |  |
| Rapportafscherming en PDF van laatste rapport | ✓ |  |  |
| Profielscores (gratis tot 80%), veldrechten, nauwkeurigheidslabel | ✓ |  |  |
| Prijspagina NL/EN met structured data | ✓ |  |  |
| Servicemails: aankoop, welkom, looptijd voorbij, verlengherinnering, opzegbevestiging | ✓ |  |  |
| Cadeaumetingen (2 per jaar, 1 bij instap) |  | ✓ |  |
| Instap ook voor cadeau-ontvangers |  | ✓ |  |
| Evaluatie- en reviewmail met Trustpilot |  | ✓ |  |
| Aanbodmail na afloop, terugkeermail bij nieuwe fiets |  | ✓ |  |
| Afspraak in de app plannen; fitter ziet profiel met toestemming |  |  | ✓ |
| Millimetermarges per aanbeveling |  |  | ✓ (na validatie) |
| Video-analyse als betaalde aanvulling |  |  | ✓ (als gebruikers erom vragen) |

**Regel voor de prijspagina in 2.0:** cadeaus worden nog niet genoemd. Jaarabonnees uit de 2.0-periode krijgen hun 2 cadeaus automatisch zodra 2.1 live is; dat melden we hen dan als extra.

## Werkpakketten

Acht pakketten, elk met een stap in het technische plan; pakket H (persoonlijke bikefit) loopt parallel aan B in week 2–3. Stripe blijft uit tot het laatste pakket van 2.0.

| # | Pakket | Release | Hangt af van | Klaar als |
| --- | --- | --- | --- | --- |
| A | Producten en rechtenmodel (stap 01) | 2.0 | – | Rechten per gebruiker en per fiets werken in tests; verlopen rechten vallen dagelijks terug naar gratis |
| B | Stripe checkout, webhooks, opzeggen (stap 02) | 2.0 | A | Losse meting (€13,50), jaar (€24,50), instap (€13,50) en jaar + persoonlijke bikefit (€234,50) werken in testmodus; verlenging via test clock kost €19,50; opzeggen in jaar 2 geeft restitutie naar rato |
| C | Profielscores en veldrechten (stap 04) | 2.0 | A | Gratis volledig ingevuld = exact 80%; server weigert betaalde velden zonder recht; klachtenvelden altijd bewerkbaar |
| D | Rapport en PDF (stap 05) | 2.0 | A, C | Gratis ziet kernwaarden en kan PDF van laatste rapport downloaden; losse meting opent alleen die fiets |
| E | Prijspagina, betaalstroom en teksten (stap 06) | 2.0 | A | drie prijskaarten verticaal naast elkaar (losse meting \| jaarabonnement \| jaar + persoonlijke bikefit), het jaarabonnement in het midden, iets hoger en qua kleur het meest opvallend (inkt met lime prijs en badge "Favoriete keuze"), zowel op de prijspagina als in betaalstap 1; op mobiel gestapeld met het jaar bovenaan; afleidingsvrije betaalstroom volgens het canvas; geen €9, €12,50 of "/ maand" meer in de code; NL en EN gelijk |
| F | Servicemails (deel van stap 07) | 2.0 | A, B | Vijf servicemails in NL en EN; verlengherinnering toont €19,50 en "€5 korting" |
| H | Persoonlijke bikefit | 2.0 | B | Na betaling ziet de klant "Plan je afspraak" met werkende agendalink; fitter krijgt een melding met naam en e-mail; annuleringsvoorwaarden staan in de voorwaarden en bij de betaalstap |
| G | Cadeaus, review- en aanbodmails (stap 03 en rest van 07) | 2.1 | 2.0 live | Jaarabonnee verstuurt max. 2 cadeaus; iedereen ziet dezelfde Trustpilot-uitnodiging |

De volledige acceptatiecriteria per pakket staan in de genummerde stappen van het technische plan.

## Planning

Release 2.0 is na circa 5 weken klaar voor livegang, 2.1 twee weken later. Twee poorten bepalen of we doorgaan.

&#91;embedded content: roadmap · 5 fasen, 2 poorten\]

De aankondiging aan bestaande gebruikers gaat eind week 3 uit, 14 dagen vóór de geplande livegang. Schuift poort 1, dan schuift de livegang mee en sturen we een korte update.

## Testplan

Elk pakket levert zijn eigen tests; vóór livegang draaien we vier lagen.

1. **Unit- en contracttests** (bestaande Vitest-opzet): rechtenhelper, profielscores, webhook-routes, idempotentie van dubbele events, e-mailtemplates in beide talen.
2. **Stripe testmodus, eind tot eind:**
   - losse meting kopen voor fiets A, controleren dat fiets B dicht blijft;
   - jaarabonnement afsluiten, eerste factuur €24,50;
   - met een test clock een jaar doorspoelen, verlenging €19,50;
   - opzeggen in jaar 1 (toegang tot einddatum) en in jaar 2 (restitutie naar rato);
   - mislukte betaling bij verlenging: toegang en mail correct;
   - checkout zonder afstandsrecht-vinkje is niet mogelijk.
3. **Gebruikerstest** met 5 fietsers volgens het bestaande usability-playbook: begrijpen ze wat gratis is, wat betaald toevoegt, en wat er na afloop gebeurt? Doel: 4 van de 5 kunnen het zonder hulp uitleggen.
4. **Productietest** met echte betaling: losse meting kopen, rapport en PDF openen, terugbetalen; jaar afsluiten en direct opzeggen.

Extra voor de persoonlijke bikefit: in testmodus €234,50 betalen, de agendalink openen, een afspraak boeken en controleren dat de fitter de melding krijgt; na een gesimuleerd jaar verlengt het abonnement voor €19,50 zonder nieuwe afspraak.

Verder: `npm run lint`, `typecheck`, `test`, `test:i18n` en `vercel:preflight` moeten groen zijn op de releasebranch.

## Overgang voor bestaande gebruikers

Nu staan betalingen uit en ziet iedereen het volledige rapport gratis. Na 2.0 zien gratis gebruikers alleen nog de kernwaarden. Die verandering kondigen we vooraf eerlijk aan, met een bedankje voor wie er al is.

**Voorstel**

- Iedereen met een account en minstens één rapport behoudt het volledige rapport (en de volledige PDF) dat hij al heeft. Bestaande rapporten worden gemarkeerd als "gemaakt met volledige toegang".
- Bestaande accounts krijgen eenmalig één gratis losse meting, 3 maanden geldig, te gebruiken binnen 2 maanden na livegang.
- Eventuele bestaande Pro-gebruikers (controleren in `/admin/subscriptions`) krijgen het jaarabonnement tot het einde van hun huidige periode, zonder extra kosten.

**Communicatie**

| Wanneer | Kanaal | Boodschap |
| --- | --- | --- |
| 14 dagen vóór livegang | Servicemail aan alle accounts | Wat verandert, wat ze houden, hun gratis losse meting |
| Bij livegang | Melding in het dashboard, eenmalig | Nieuwe prijzen, link naar de prijspagina |
| 7 dagen vóór verlopen van de gratis meting | Servicemail | Herinnering om hem te gebruiken |

De aankondiging is servicecommunicatie (wijziging van de dienst) en gaat dus ook naar gebruikers zonder marketingtoestemming. Er staat geen verkoopboodschap in behalve de link naar de prijspagina.

## Go/no-go en terugdraaien

Release 2.0 gaat live als alle punten hieronder zijn afgevinkt; anders schuift de datum.

- [ ] Alle tests groen op de releasebranch
- [ ] Stripe testmodus eind tot eind geslaagd (zie testplan)
- [ ] Voorwaarden, privacyverklaring en afstandsrechttekst juridisch getoetst
- [ ] Btw-instelling in Stripe gekozen en getest
- [ ] Live producten, prijzen, €5-item en €7-coupon aangemaakt; ID's in productie-env
- [ ] Live webhook ingesteld en ontvangen in productie
- [ ] Echte betaling in productie gedaan en terugbetaald
- [ ] Aankondiging aan bestaande gebruikers 14 dagen eerder verstuurd
- [ ] Sentry-alerts op checkout- en webhookfouten actief

**Terugdraaien:** de vlag `isStripeBillingEnabled()` terug op `false` zet rapporten weer volledig open en stopt nieuwe aankopen. Betaalde rechten blijven staan, Stripe-abonnementen lopen door. Een terugdraai melden we aan betalende klanten met een servicemail.

## Na livegang

De eerste 48 uur bewaken we de techniek; daarna sturen we wekelijks op de hypotheses uit de pricingstrategie.

| Wanneer | Wat we bekijken | Actie |
| --- | --- | --- |
| Eerste 48 uur | Webhookfouten, mislukte checkouts, supportvragen | Elke fout dezelfde dag oplossen; bij meer dan 2 % mislukte checkouts terugdraaien overwegen |
| Wekelijks | Calculator → account, account → losse meting, aandeel jaar, opzeggingen | Kort overzicht in het admin-dashboard |
| Na 4 weken | Alle hypotheses uit de strategie | Besluit: teksten, moment of prijs aanpassen (in die volgorde) |
| Na 12 weken | Conversie, verlengintentie, Trustpilot-score | Besluit over geld-terug-garantie en video-analyse |

We meten stappen in de trechter, nooit de inhoud van profielen. Lichaamsmaten en klachten gaan niet naar analytics.

## Beslissingen vóór de start

Deze punten bepalen de bouw of de juridische tekst; ze moeten in week 1 besloten zijn.

- [ ] Akkoord op de splitsing 2.0 / 2.1
- [ ] Overgangsaanbod: één gratis losse meting voor bestaande accounts, ja of nee
- [ ] Komt een niet-verzilverde cadeauplek terug bij de gever? (voorstel: ja; nodig voor 2.1)
- [ ] Bevestigen: instap en cadeauwaarde volgen de losse meting (€13,50)
- [ ] Bevestigen: persoonlijke bikefit verlengt na jaar 1 als jaarabonnement voor €19,50
- [ ] Persoonlijke bikefit: locatie(s), duur van de afspraak, welke fitter(s), maximale capaciteit per maand
- [ ] Agendatool voor het plannen van afspraken (link vanuit de app en de bevestigingsmail)
- [ ] Annuleringsvoorwaarden voor de afspraak (herroepingsrecht bij diensten wijkt af van digitale inhoud; juridisch toetsen)
- [ ] Jurist kiezen en voorwaarden laten toetsen (doorlooptijd meenemen in de planning)
- [ ] Btw: Stripe Tax of vaste tarieven
- [ ] Betaalmethode voor automatische verlenging: SEPA-incasso via iDEAL-mandaat, kaart, of beide
- [ ] GitHub-toegang voor Claude, zodat plannen en code als pull request kunnen worden aangeboden
