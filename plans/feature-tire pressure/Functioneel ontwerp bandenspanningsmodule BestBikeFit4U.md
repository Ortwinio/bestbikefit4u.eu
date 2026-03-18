# **Functioneel ontwerp bandenspanningsmodule BestBikeFit4U.eu**

## **1\. Doel van de feature**

De bandenspanningsmodule moet drie doelen dienen:

1. **Leadgeneratie**

   * gratis tool zonder login

   * laagdrempelige instap

   * SEO-waarde op pagina’s als:

     * bandenspanning racefiets

     * bandenspanning gravelbike

     * bandenspanning MTB

2. **Gebruikersbinding**

   * uitgebreide calculator achter login

   * opslag per fiets/wielset/bandenset

   * persoonlijke drukadviezen

3. **Cross-sell binnen BestBikeFit4U**

   * koppeling met bikefit-profiel

   * koppeling met rijdoel, comfort, blessurerisico en bike setup

   * voorbereiding op Strava, wearables en toekomstige AI-bikefit features

---

# **2\. Positionering binnen BestBikeFit4U**

## **Openbare feature**

Naam:  
 **Gratis bandenspanningscalculator**

Doel:

* snelle, eenvoudige berekening

* geen account nodig

* direct resultaat

Gebruikssituatie:

* first-time bezoekers

* SEO traffic

* mobiele gebruikers

* mensen die snel een advies zoeken voor race, gravel of MTB

## **Premium / ingelogde feature**

Naam:  
 **Slimme bandenspanningsassistent**

Doel:

* persoonlijke, nauwkeurige drukadviezen

* fiets-specifieke opslag

* vergelijking met huidige druk

* route-context en Strava-integratie

* overzicht van instellingen per fiets

Gebruikssituatie:

* terugkerende gebruikers

* sportieve fietsers

* gebruikers met meerdere fietsen

* mensen die willen optimaliseren op comfort, snelheid of grip

---

# **3\. Hoofdstructuur in de website**

## **Navigatie**

De bandenspanningsfeature komt op 3 plekken terug:

### **A. Publieke navigatie**

Menu-item:

* `Tools`

  * `Bandenspanningscalculator`

Of:

* `Calculators`

  * `Bandenspanning`

### **B. Binnen account / dashboard**

Menu-item:

* `Mijn fietsen`

* `Bandenspanning`

* `Instellingen`

### **C. In de output van bikefit**

Bij een bikefit-advies:

* sectie `Aanvullende setup`

* daar een blok:

  * aanbevolen bandenspanning per fietsdiscipline

  * link naar uitgebreide calculator

---

# **4\. Productstructuur**

## **Module 1 — Gratis calculator zonder login**

Scope:

* snelle adviesdruk

* beperkt aantal inputs

* geen opslag

* geen Strava

* geen meerdere fietsen

## **Module 2 — Uitgebreide calculator achter login**

Scope:

* volledige invoer

* opslag per fiets

* meerdere wielsets en bandensets

* huidige druk vs aanbevolen druk

* routecontext

* Strava optioneel

* trend / historie

## **Module 3 — Fietsoverzicht**

Scope:

* in 1 oogopslag per fiets:

  * huidige aanbevolen druk

  * huidige geregistreerde druk

  * bandtype

  * wielset

  * laatst gebruikte setup

  * doel: race / endurance / gravel / nat weer / comfort

---

# **5\. Gratis calculator zonder login**

## **5.1 Doel**

De gratis calculator moet binnen 30–60 seconden bruikbaar zijn.

## **5.2 Inputs**

Verplicht:

* fietstype

  * racefiets

  * gravelbike

  * MTB

* lichaamsgewicht

* bandbreedte voor

* bandbreedte achter

* type band

  * binnenband

  * tubeless

* ondergrond

  * glad asfalt

  * gemiddeld asfalt

  * slecht asfalt

  * hardpack gravel

  * losse gravel

  * trail

Optioneel:

* fietsgewicht

* rijdoel

  * snelheid

  * balans

  * comfort

## **5.3 Output**

* aanbevolen druk voor

* aanbevolen druk achter

* bar \+ psi

* korte toelichting

* eenvoudige waarschuwing:

  * “controleer altijd de maximale druk van band en velg”

## **5.4 Extra outputtekst**

Na berekening:

* “Wil je weten hoe dit zich verhoudt tot jouw huidige druk?”

* CTA:

  * `Vergelijk met mijn huidige setup`

  * opent login/sign-up flow of inline uitbreiding

## **5.5 UX-principes**

* mobile-first

* 1 scherm

* sliders voor gewicht

* segmented controls voor fietstype

* dropdown of chips voor ondergrond

* real-time resultaat

## **5.6 Beperkingen gratis versie**

Niet beschikbaar:

* opslag

* meerdere fietsen

* Strava

* wheel/rim detail

* uitgebreide waarschuwingen

* route-specifieke personalisatie

---

# **6\. Uitgebreide calculator achter login**

## **6.1 Doel**

De uitgebreide calculator moet voelen als een persoonlijke setup-assistent.

## **6.2 Inputs**

### **Stap 1 — Fiets kiezen**

* bestaande fiets selecteren

* of nieuwe fiets aanmaken

### **Stap 2 — Fietsconfiguratie**

* fietsnaam

* discipline

  * road

  * gravel

  * MTB

  * tri/tt later uitbreidbaar

* fietsgewicht

* rijpositie

  * agressief

  * neutraal

  * ontspannen

### **Stap 3 — Wielset en banden**

* wielsetnaam

* velgtype

  * hooked

  * hookless

* interne velgbreedte voor

* interne velgbreedte achter

* bandmerk/model

* bandbreedte voor

* bandbreedte achter

* casing

  * licht / race

  * allround

  * reinforced

* setup

  * binnenband

  * latex

  * tubeless

### **Stap 4 — Gebruiker en belasting**

* lichaamsgewicht

* extra bagage

* bidons / gear

* weersomstandigheden

* nat / droog

* temperatuur optioneel later

### **Stap 5 — Huidige druk**

* huidige druk voor

* huidige druk achter

### **Stap 6 — Rijstijl / doel**

* snelheid

* endurance

* comfort

* nat weer grip

* technische controle

### **Stap 7 — Routecontext**

Keuze:

* handmatig

* Strava import

* zonder route

Handmatig:

* routeafstand

* hoogtemeters

* type ondergrond

* percentage off-road

* technische moeilijkheid

Strava:

* recente activiteit selecteren

* route selecteren

* profiel automatisch afleiden

---

# **7\. Output van uitgebreide calculator**

## **7.1 Primaire output**

* aanbevolen druk voor / achter

* aanbevolen druk nu

* advies in bar en psi

* verschil met huidige druk

## **7.2 Secundaire output**

* comfortinschatting

* gripinschatting

* efficiëntie/snelheidsinschatting

* risico-indicator

## **7.3 Tekstuele uitleg**

Voorbeeld:

* “Je huidige druk ligt relatief hoog voor 30 mm tubeless banden op gemiddeld Nederlands asfalt.”

* “Met 0.8 bar minder voor en 0.9 bar minder achter verwacht je meer comfort, meer grip en waarschijnlijk geen snelheidsverlies op normaal wegdek.”

## **7.4 Testadvies**

* “Probeer eerst 0.3 bar lager”

* “Test dit op een bekende route”

* “Let op handen, schouders, bochtengrip en rolgevoel”

## **7.5 Veiligheidswaarschuwingen**

* maximale velgdruk overschreden

* hookless limiet

* druk te laag voor setup

* drukverschil voor/achter onlogisch

* binnenband \+ te lage druk \= pinch-flat risico

---

# **8\. Overzicht per fiets: in 1 oogopslag**

Dit is een kernonderdeel van je vraag en moet een eigen scherm worden.

## **Schermnaam**

**Mijn fietsen**

## **Doel**

De gebruiker moet direct zien:

* welke fietsen zijn opgeslagen

* wat per fiets de aanbevolen druk is

* welke setup actief is

* wat de huidige druk was bij laatste rit of laatste invoer

## **Card-layout per fiets**

Elke fiets krijgt een kaart met:

### **Bovenste regel**

* fietsnaam

* discipline

* eventueel foto

### **Midden**

* actieve wielset

* actieve bandenset

* aanbevolen druk:

  * `Voor 5.2 bar`

  * `Achter 5.6 bar`

### **Onder**

* laatst geregistreerde druk:

  * `Nu: 6.0 / 6.4`

* statuslabel:

  * `in lijn`

  * `iets te hoog`

  * `te hoog`

  * `te laag`

* rijprofiel:

  * `endurance`

  * `race`

  * `gravel mixed`

  * `nat weer`

### **Acties**

* `Bekijk`

* `Aanpassen`

* `Nieuwe route berekenen`

* `Strava-route gebruiken`

## **Snelle visuele status**

Kleur of indicator:

* groen \= binnen optimum

* oranje \= lichte afwijking

* rood \= duidelijke afwijking

Niet te veel gamification; functioneel en helder.

---

# **9\. Schermarchitectuur**

## **Publieke flow**

1. Landing page bandenspanning

2. Gratis calculator

3. Resultaat

4. CTA:

   * maak account voor uitgebreid advies

   * sla je fiets op

   * vergelijk met je huidige druk

## **Ingelogde flow**

1. Dashboard

2. Mijn fietsen

3. Fietsdetail

4. Bandenspanning

5. Uitgebreide calculator

6. Resultaat opslaan

7. Historie / testlog

---

# **10\. Pagina’s en componenten**

## **10.1 Publieke pagina**

Route:  
 `/bandenspanning-calculator`

Componenten:

* hero

* calculator form

* result card

* uitlegblok

* FAQ

* CTA naar login

## **10.2 Dashboard overzicht**

Route:  
 `/dashboard/bikes`

Componenten:

* bike cards

* filter discipline

* knop fiets toevoegen

* summary widget:

  * aantal fietsen

  * aantal setups

  * laatst berekende adviezen

## **10.3 Fietsdetail**

Route:  
 `/dashboard/bikes/[bikeId]`

Componenten:

* fietsheader

* actieve setup

* aanbevolen druk

* huidige druk

* knop nieuwe berekening

* pressure history

* gekoppelde Strava-routes

## **10.4 Uitgebreide calculator**

Route:  
 `/dashboard/pressure-calculator`

Componenten:

* stepper wizard

* input validation

* route selector

* result comparison

* save preset

---

# **11\. Gebruikersrollen**

## **Niet-ingelogde gebruiker**

Mag:

* gratis calculator gebruiken

* resultaten bekijken

* geen opslag

## **Ingelogde gratis gebruiker**

Mag:

* 1 of 2 fietsen opslaan

* uitgebreide calculator beperkt gebruiken

* huidige druk vergelijken

* geen Strava of beperkte Strava

## **Premium gebruiker**

Mag:

* onbeperkt fietsen

* meerdere wielsets per fiets

* Strava import

* route-specifieke druk

* historie

* presets

* comfort/race/gravel profielen

---

# **12\. Functionele eisen gratis calculator**

## **FE-G-1**

Gebruiker kan zonder login een bandenspanningsadvies berekenen.

## **FE-G-2**

Gebruiker ziet direct:

* adviesdruk voor

* adviesdruk achter

* bar/psi

## **FE-G-3**

Gebruiker kan kiezen uit road, gravel, MTB.

## **FE-G-4**

Gebruiker kan ondergrond selecteren.

## **FE-G-5**

Calculator werkt volledig mobiel.

## **FE-G-6**

Na resultaat ziet gebruiker CTA naar uitgebreide versie.

---

# **13\. Functionele eisen uitgebreide calculator**

## **FE-U-1**

Gebruiker kan meerdere fietsen beheren.

## **FE-U-2**

Per fiets kan gebruiker meerdere setups opslaan:

* wielset

* bandenset

* routeprofiel

## **FE-U-3**

Gebruiker kan huidige druk invoeren en vergelijken met aanbevolen druk.

## **FE-U-4**

Gebruiker ontvangt een interpretatie:

* comfort

* grip

* efficiency

* risico

## **FE-U-5**

Gebruiker kan een route handmatig invoeren of via Strava kiezen.

## **FE-U-6**

Gebruiker kan resultaat opslaan als preset:

* race

* endurance

* nat weer

* gravel mixed

## **FE-U-7**

Dashboard toont per fiets de actuele aanbevolen druk in 1 oogopslag.

---

# **14\. Niet-functionele eisen**

## **Performance**

* berekening \< 300 ms client-side of API roundtrip \< 1 sec

* dashboard snel laden

* mobiele optimalisatie prioriteit

## **UX**

* duidelijke invoervalidatie

* niet te technisch voor beginners

* wel uitbreidbaar voor experts

## **Betrouwbaarheid**

* altijd disclaimer dat fabrikantlimieten leidend zijn

* expliciete safety checks

## **Privacy**

* Strava alleen na expliciete toestemming

* routegegevens alleen opslaan indien gebruiker daarvoor kiest

---

# **15\. Logica-overzicht gratis vs uitgebreid**

## **Gratis engine**

Gebaseerd op:

* gewicht

* bandbreedte

* discipline

* ondergrond

* tubeless/inner tube

## **Uitgebreide engine**

Gebaseerd op:

* alles uit gratis versie

* plus:

  * velgbreedte

  * rim type

  * casing

  * totale systeemmassa

  * routeprofiel

  * Strava-data

  * huidige druk

  * gebruiksdoel

---

# **16\. Domeinmodel / datamodel**

## **Tabel: users**

* id

* name

* email

* planType

* createdAt

## **Tabel: bikes**

* id

* userId

* name

* discipline

* brand

* model

* bikeWeightKg

* photoUrl

* fitProfileId optional

## **Tabel: wheelsets**

* id

* bikeId

* name

* rimType

* internalRimWidthFrontMm

* internalRimWidthRearMm

## **Tabel: tire\_setups**

* id

* wheelsetId

* name

* brand

* model

* widthFrontMm

* widthRearMm

* tubeType

* casingType

* maxPressureBar optional

## **Tabel: pressure\_profiles**

* id

* bikeId

* tireSetupId

* name

* useCase

* targetSurface

* targetGoal

* recommendedFrontBar

* recommendedRearBar

* lastCalculatedAt

## **Tabel: pressure\_calculations**

* id

* userId

* bikeId

* tireSetupId

* sourceType

* currentFrontBar

* currentRearBar

* recommendedFrontBar

* recommendedRearBar

* comfortScore

* gripScore

* efficiencyScore

* warningsJson

* routeContextJson

* createdAt

## **Tabel: strava\_connections**

* id

* userId

* athleteId

* accessTokenEncrypted

* refreshTokenEncrypted

* expiresAt

## **Tabel: strava\_routes**

* id

* userId

* stravaRouteId

* name

* distanceKm

* elevationM

* derivedSurfaceScore

* rawDataJson

## **Tabel: strava\_activities**

* id

* userId

* stravaActivityId

* bikeTypeGuess

* distanceKm

* elevationM

* avgSpeed

* derivedSurfaceScore

* rawDataJson

---

# **17\. Dashboard ontwerp**

## **Dashboard widget 1 — Mijn fietsen**

Toont cards per fiets.

## **Dashboard widget 2 — Actuele drukstatus**

Samenvatting:

* 3 fietsen

* 1 fiets staat te hard

* 1 fiets optimaal

* 1 fiets heeft geen recente berekening

## **Dashboard widget 3 — Laatste berekeningen**

* Canyon Aeroad — Race setup — 5.3 / 5.7

* Gravelbike — Mixed gravel — 2.4 / 2.7

## **Dashboard widget 4 — Snelle acties**

* nieuwe fiets toevoegen

* nieuwe druk berekenen

* Strava koppelen

---

# **18\. Aanbevolen UX-ontwerp per scherm**

## **Gratis calculator**

Compact, direct, minder tekst.  
 Bovenaan:

* titel

* korte uitleg

* formulier

* resultaat direct zichtbaar

## **Uitgebreide calculator**

Wizardvorm:

* stap 1 fiets

* stap 2 banden/wielen

* stap 3 gewicht/doel

* stap 4 route

* stap 5 resultaat

Waarom wizard:

* minder cognitieve load

* beter mobiel

* makkelijker validatie per stap

## **Mijn fietsen**

Card-based layout met desktop grid en mobiele stacked cards.

---

# **19\. Edge cases**

De feature moet omgaan met:

* 1 bandbreedte ingevuld, voor/achter identiek maken

* gebruiker kent velgbreedte niet

  * toon default / overslaan

* gebruiker weet huidige druk niet

  * vergelijking overslaan

* gebruiker heeft meerdere wielsets

* gebruiker gebruikt hookless zonder max druk te kennen

* gebruiker voert onrealistische combinatie in

  * 25 mm band \+ 3.0 bar \+ 95 kg

* gebruiker gebruikt verschillende breedte voor/achter

---

# **20\. Validatieregels**

## **Basisvalidatie**

* gewicht 35–160 kg

* bandbreedte discipline-afhankelijk

* druk 0.8–9.0 bar

* MTB liefst inch of automatische conversie

## **Logische validatie**

* road band \< 20 mm of \> 40 mm waarschuwen

* gravel \< 30 mm of \> 65 mm waarschuwen

* MTB \< 45 mm waarschuwen

* achterdruk meestal \>= voordruk

* hookless maxdruk hard limiteren als bekende limiet aanwezig is

---

# **21\. Conversie- en leadstrategie**

## **Publieke pagina CTA’s**

Na gratis resultaat:

* sla jouw fiets op

* vergelijk met je huidige setup

* krijg route-specifiek advies

* verbind Strava

## **Lead magnets**

* “Bewaar je ideale bandenspanning per fiets”

* “Krijg drukadvies op basis van je route”

* “Vergelijk comfort- en racesetup”

---

# **22\. Integratie met bestaande BestBikeFit4U-logica**

Deze module moet later gekoppeld kunnen worden aan:

* lichaamsmetingen

* flexibiliteit

* discipline

* comfort/performance profiel

* blessuregevoeligheid

Voorbeeld:  
 iemand met lage rugklachten \+ endurance doel \+ ruwer asfalt:

* systeem weegt comfort zwaarder

* dus iets lagere druk binnen veilige grenzen

Zo wordt de drukcalculator geen los tooltje, maar onderdeel van het bredere fit-ecosysteem.

---

# **23\. MVP-advies**

## **Fase 1**

* publieke calculator

* login

* fiets opslaan

* dashboard met bike cards

* uitgebreide calculator zonder Strava

## **Fase 2**

* huidige druk vergelijken

* presets opslaan

* meerdere wielsets

* waarschuwingen uitbreiden

## **Fase 3**

* Strava-koppeling

* routegebaseerde correctie

* historie

* feedback loop

---

# **24\. Aanbevolen technische architectuur**

Gezien je eerdere richting zou dit goed passen in:

* **Next.js** frontend

* **Convex** database \+ realtime data

* **NextAuth of Clerk** voor authenticatie

* **Strava OAuth** integratie

* calculator-engine als:

  * gedeelde TypeScript domain layer

  * deels client-side voor snelle UX

  * server-side validatie voor opslag

## **Aanbevolen modules**

* `pressure-engine`

* `bike-profile-service`

* `pressure-profile-service`

* `strava-service`

* `dashboard-service`

---

# **25\. Concreet schermoverzicht**

## **Publiek**

* `/bandenspanning-calculator`

* `/bandenspanning/racefiets`

* `/bandenspanning/gravelbike`

* `/bandenspanning/mtb`

## **Auth**

* `/dashboard`

* `/dashboard/bikes`

* `/dashboard/bikes/new`

* `/dashboard/bikes/[id]`

* `/dashboard/pressure-calculator`

* `/dashboard/pressure-history`

* `/dashboard/integrations/strava`

---

# **26\. Succescriteria**

De feature is succesvol als:

## **Publiek**

* hoge conversie van bezoekers naar calculatorgebruik

* goede SEO-traffic

* goede doorklik naar account

## **Ingelogd**

* gebruikers slaan fietsen op

* gebruikers komen terug voor herberekeningen

* Strava-koppeling wordt gebruikt

* module ondersteunt upsell naar premium

---

# **27\. Mijn productadvies**

Ik zou dit commercieel positioneren als twee lagen:

## **Gratis**

**"Bereken direct je bandenspanning"**

## **Premium**

**"Beheer je ideale bandenspanning per fiets, setup en route"**

Dat tweede is het onderscheidende deel. Niet alleen een calculator, maar een **persoonlijk setup-overzicht per fiets**. Dat past veel beter bij BestBikeFit4U dan een generieke losstaande druktool.

De belangrijkste UX-belofte moet zijn:

**“Open je dashboard en zie direct per fiets welke druk je moet rijden.”**

Dat is concreet, waardevol en dagelijks bruikbaar.

Ik kan dit nu verder uitwerken naar een **PRD \+ user stories \+ wireframe-structuur \+ database schema in Convex/Next.js formaat**.

