# Spec — new email design + bilingual emails (from Ortwin, 2026-10-02)

This is the product owner's specification. Copy in section 5 is **fixed**: use it literally.
`{…}` is filled with real data. **Bold** in the copy is bold in the mail.

## 2. Language preference

### Storage
- Add `locale: "nl" | "en"` to the user (optional in the schema, existing records stay valid).
- When a logged-in user switches language on the website, save it immediately via a mutation.
  From then on every mail uses the new language, including mails that were already scheduled.
- On sign-up and when requesting a login code the frontend sends the page language. Mail 1 goes out
  before an account exists, so use that sent language there. For a new account it becomes the first
  value of `locale`.
- The case-study form sends the page language; mail 6 uses it.

### Resolving at send time (one helper, e.g. `resolveEmailLocale`)
1. `user.locale` if present
2. else the language sent with the request
3. else the site default language (`DEFAULT_LOCALE` in `src/i18n/config.ts` = `"en"`). Never guess from country or email domain.

Cron mails read the language at send time, not when scheduling.

### Formatting per language
- Numbers: NL `172,5 mm`, EN `172.5 mm`. Use `Intl.NumberFormat`.
- Dates: NL `15-02-2026`, EN `15 Feb 2026`.
- Price: NL `€9 per maand`, EN `€9 per month`.
- `lang="nl"` or `lang="en"` on the mail's `<html>`.

Mail 5 is internal and stays Dutch.

## 3. Architecture
- One shared layout for all mails: header, optional hero, content, sign-off and footer. Building blocks are reusable components (section 4).
- Copy separate from layout: `convex/emails/i18n/nl.ts` and `en.ts` with the same keys. Types such that a missing translation is a type error.
- Every mail is a function `(data, locale) → { subject, preheader, html, text }`. `text` is a plain-text version sent along.
- Placeholders like `{voornaam}` and `{zadelhoogte}` are filled with real data. No first name → "Hoi," / "Hi,".
- `lifecycleEmailLog` also logs the language used.

## 4. Design (BestBikeFit4U house style)
Canvas "BestBikeFit4U redesign", page E-mails (one board with building blocks, one per mail). Without access, this spec is enough.

Colours: Lime `#CFF26A` (hero area, number dots) · Petrol `#0A7263` (button, links, icons) · Mint `#E1F2EE` (tip block, app block, icon tile) · Ink `#0F2420` (headings, text on lime) · Body text `#3B4F4A` · Muted `#4A5F5A` (small print, footer) · Border `#DCE6E1` · Paper `#F5F8F3` (background, tiles).
Rules: lime never as text colour, white text only on petrol or ink, at most one lime area per mail.

Typography (with fallbacks):
- Headings: `'Bricolage Grotesque', Arial, sans-serif`, 800, 28–30 px
- Text: `Figtree, Helvetica, Arial, sans-serif`, 16 px, line-height 1.55
- Numbers/measurements: `'DM Mono', 'Courier New', monospace`, unit small and muted next to it

Structure:
- Paper background with a white card, 600 px wide (radius 24), 40 px padding (24 px on mobile).
- Header: horizontal logo (179×30, PNG at 2x hosted on our own domain) with a 4 px lime line below.
- Optional hero: lime area with eyebrow (12 px, uppercase, 0.08em), heading, optionally a big DM Mono number (56 px) with unit after it.
- Value tiles: 2-column grid. Each tile: paper background, 1 px border, radius 16, 13 px label, 28 px DM Mono value.
- Value rows: table, label left, DM Mono value right, 1 px rules.
- Benefits: 44×44 icon tile (mint with petrol icon, first item optionally lime), bold title and one line of text.
- Numbered tips: paper block with a lime dot (DM Mono digit), bold title and text.
- Tip block: mint area with an icon and text.
- Button: one per mail, petrol with white text, radius 999, min 48 px high, 16 px bold. Rectangular VML fallback for Outlook allowed.
- Sign-off: "Fijne rit, / Team BestBikeFit4U" or "Enjoy the ride, / Team BestBikeFit4U".
- Footer, outside the card, centred, 12 px muted: the reason for the mail and bestbikefit4u.eu. Service and marketing mails add "Afmelden · E-mailvoorkeuren" (EN: "Unsubscribe · Email preferences").
- Icons: line icons (stroke 2, round caps), hosted as PNG. No emoji.
- Illustrations (pen drawings) in day 1 (measuring kit), day 14 (tyre) and mail 10 (stack/reach): hosted PNG with alt text.

Email HTML requirements:
- Tables + inline styles. No flex or grid in sent HTML.
- Hidden preheader span directly after `<body>`, padded so no other text appears in the preview.
- Must work in Gmail (web/app), Apple Mail, iOS Mail, Outlook (Windows/web). No horizontal scroll at 375 px.
- Body text contrast ≥ 4.5:1. Set color-scheme meta tags; text must stay readable in dark mode.

## 5. Copy (fixed)

### Mail 1 · Login code (transactional, no button)
| | NL | EN |
|---|---|---|
| Subject | {code} is je BestBikeFit4U-inlogcode | {code} is your BestBikeFit4U login code |
| Preheader | 15 minuten geldig. Je fietsen staan klaar. | Valid for 15 minutes. Your bikes are waiting. |
| Heading | Je inlogcode | Your login code |
| Text | [code large in mint block] Hij is 15 minuten geldig. Je fietsen en fitwaarden staan voor je klaar. | [code] It's valid for 15 minutes. Your bikes and fit numbers are ready for you. |
| Small | Niet aangevraagd? Negeer deze mail, er gebeurt niets. | Didn't request this? Ignore this email, nothing will happen. |

### Mail 2 · Results summary
| | NL | EN |
|---|---|---|
| Subject | Je fit is klaar: zadel op {zadelhoogte} mm | Your fit is ready: saddle at {saddleHeight} mm |
| Preheader | Plus wat je als eerste aanpast. | Plus what to adjust first. |
| Hero | JE FIT IS KLAAR · Je startpunt staat klaar · {zadelhoogte} mm · zadelhoogte, testmarge {min}–{max} mm | YOUR FIT IS READY · Your starting point is ready · {saddleHeight} mm · saddle height, test range {min}–{max} mm |
| Text | Hoi {voornaam}, dit zijn je belangrijkste waarden voor je {fiets}: [tegels: zadelhoogte, drop, stuurpen, cranklengte] In je rapport vind je de rest én je stappenplan: wat je eerst aanpast en hoe je het test. Eén ding tegelijk, en je voelt het verschil binnen een paar ritten. | Hi {firstName}, here are your key numbers for your {bike}: [tiles: saddle height, drop, stem, crank length] Your report has the rest, plus your step-by-step plan: what to adjust first and how to test it. One change at a time, and you'll feel the difference within a few rides. |
| Button | Bekijk mijn stappenplan | See my step-by-step plan |

Without a test range or bike, leave those parts out.

### Mail 3 · Fit report by email (now with a button)
| | NL | EN |
|---|---|---|
| Subject | Je fitrapport: framemaat {framemaat} | Your fit report: frame size {frameSize} |
| Preheader | Al je maten op een rij, handig voor je fietsenmaker. | All your numbers in one place, handy for your bike shop. |
| Hero | JE FITRAPPORT · Framemaat {framemaat} · We zijn {x}% zeker van deze maat | YOUR FIT REPORT · Frame size {frameSize} · We're {x}% confident in this size |
| Intro | Hoi {voornaam}, hier is je fitrapport. Bewaar het, of stuur het door naar je fietsenmaker. | Hi {firstName}, here's your fit report. Keep it, or forward it to your bike shop. |
| Headings | Je afstelwaarden · Framegeometrie · Tips voor jou | Your fit numbers · Frame geometry · Tips for you |
| Rows | Zadelhoogte · Terugstand zadel · Drop · Stuurpen (lengte · hoek) · Cranklengte · Stuurbreedte · Stack · Reach · Effectieve bovenbuis | Saddle height · Saddle setback · Drop · Stem (length · angle) · Crank length · Handlebar width · Stack · Reach · Effective top tube |
| Button | Open mijn stappenplan | Open my step-by-step plan |
| Footer extra | Berekend met versie {versie} | Calculated with version {version} |

"Tips voor jou" shows the existing fitNotes and is omitted when empty.

### Mail 4 · Fit Pass welcome
| | NL | EN |
|---|---|---|
| Subject | Je Fit Pass is actief. Dit kun je nu | Your Fit Pass is active. Here's what you can do now |
| Preheader | Je PDF, je stappenplan en al je fietsen. | Your PDF, your plan and all your bikes. |
| Hero | BEDANKT, {VOORNAAM} · Je Fit Pass is actief | THANK YOU, {FIRSTNAME} · Your Fit Pass is active |
| Benefits | Je rapport als PDF: om te printen of mee te nemen naar je fietsenmaker. · Je complete stappenplan: elke aanpassing in de juiste volgorde, met hoe je hem test. · Onbeperkt fietsen en fit-sessies: ook een eigen afstelling voor je tweede fiets. | Your report as a PDF: print it or take it to your bike shop. · Your complete plan: every adjustment in the right order, with how to test it. · Unlimited bikes and fit sessions: including a setup for your second bike. |
| Button | Download mijn PDF | Download my PDF |
| Small | Vragen? Beantwoord deze mail, een echt mens leest mee. | Questions? Just reply, a real person reads every email. |

### Mail 5 · Case study lead (internal) — new layout only, text stays Dutch as-is.

### Mail 6 · Case study confirmation
| | NL | EN |
|---|---|---|
| Subject | Bedankt! We mailen je over je verhaal | Thanks! We'll email you about your story |
| Preheader | Binnen een paar dagen 3 tot 5 korte vragen. | 3 to 5 short questions within a few days. |
| Heading | Bedankt voor je verhaal | Thanks for sharing your story |
| Text | Hoi {naam}, leuk dat je je verhaal wilt delen. Zo werkt het: ✓ Binnen een paar dagen mailen we je 3 tot 5 korte vragen. ✓ Alles gaat per mail: geen bellen, geen video. ✓ We publiceren niets zonder jouw aparte toestemming. | Hi {name}, great that you want to share your story. Here's how it works: ✓ Within a few days we'll email you 3 to 5 short questions. ✓ Everything happens by email: no calls, no video. ✓ We publish nothing without your separate consent. |
| Tip block | Tip: zet je huidige afstelling in de app, dan heb je je voor- en na-waarden meteen bij de hand. | Tip: add your current setup in the app, so your before and after numbers are ready. |
| Button | Bekijk mijn afstelling | View my setup |
| Small | We gebruiken je gegevens alleen hiervoor. Stoppen kan altijd: beantwoord deze mail. | We only use your details for this. You can stop at any time: just reply to this email. |

(✓ = check icon, not a character in the text.)

### Mail 7 · Fit reminder
| | NL | EN |
|---|---|---|
| Subject | Je fit in 10 minuten, met alleen een meetlint | Your fit in 10 minutes, with just a tape measure |
| Preheader | Je zadelhoogte en framemaat in millimeters. | Your saddle height and frame size in millimetres. |
| Hero | JE ACCOUNT STAAT KLAAR · Je fit nog niet. Dat kost 10 minuten | YOUR ACCOUNT IS READY · Your fit isn't yet. It takes 10 minutes |
| Text | Hoi {voornaam}, meer dan dit heb je niet nodig: Je lengte (in centimeters, zonder schoenen) · Je binnenbeenlengte (een meetlint en een boek zijn genoeg). Wat je ervoor terugkrijgt: ✓ Je zadelhoogte, met een testmarge ✓ Je stuurpositie: reach en drop ✓ De juiste stuurpenlengte ✓ Je framemaat | Hi {firstName}, this is all you need: Your height (in centimetres, no shoes) · Your inseam (a tape measure and a book will do). What you get back: ✓ Your saddle height, with a test range ✓ Your handlebar position: reach and drop ✓ The right stem length ✓ Your frame size |
| Button | Start mijn fit | Start my fit |

Change mail 7: send on **day 3** instead of after 48 h, and skip it if the user has already started a fit.

### Mail 8 · Upgrade nudge
| | NL | EN |
|---|---|---|
| Subject | Je fit op papier, en voor al je fietsen | Your fit on paper, and for all your bikes |
| Preheader | Pro: €9 per maand, maandelijks opzegbaar. | Pro: €9 per month, cancel any month. |
| Heading | Haal meer uit je fit | Get more from your fit |
| Text | Hoi {voornaam}, je fitwaarden staan klaar. Met Pro krijg je er dit bij: Een PDF van je rapport (om mee te nemen naar je fietsenmaker) · Al je fietsen (een eigen afstelling voor je racefiets én je gravelbike) · Je rapport in je inbox (wanneer je maar wilt). [prijsblok] €9 per maand · opzeggen kan altijd | Hi {firstName}, your fit numbers are ready. Pro adds: A PDF of your report (to take to your bike shop) · All your bikes (a separate setup for your road bike and your gravel bike) · Your report in your inbox (whenever you like). [price] €9 per month · cancel any time |
| Button | Bekijk wat Pro je geeft | See what Pro gives you |
| Small | Vragen? Beantwoord deze mail, een echt mens leest mee. | Questions? Just reply, a real person reads every email. |

### Mail 9 · Win-back (no seasonal reference)
| | NL | EN |
|---|---|---|
| Subject | Klopt je fit nog? | Is your fit still right? |
| Preheader | Nieuwe fiets of een paar kilo verschil? Check het in 5 minuten. | New bike or a few kilos difference? Check in 5 minutes. |
| Hero | EVEN CHECKEN · Klopt je fit nog? | QUICK CHECK · Is your fit still right? |
| Text | Hoi {voornaam}, een nieuwe fiets, nieuwe schoenen of een paar kilo verschil verandert je ideale houding vaak meer dan je denkt. Je vorige waarden [tegels: zadelhoogte, drop] Vastgelegd op {datum} voor je {fiets}. Een nieuwe sessie laat in 5 minuten zien of ze nog kloppen. | Hi {firstName}, a new bike, new shoes or a few kilos difference often changes your ideal position more than you'd think. Your previous numbers [tiles] Recorded on {date} for your {bike}. A new session shows in 5 minutes whether they still fit. |
| Button | Check mijn waarden | Check my numbers |

### Mail 10 · Pro 24-hour explainer (shortened)
| | NL | EN |
|---|---|---|
| Subject | Zo haal je het meeste uit je fitwaarden | How to get the most from your fit numbers |
| Preheader | Drie waarden, drie tips. Twee minuten lezen. | Three numbers, three tips. A two-minute read. |
| Heading | Zo haal je het meeste uit je fitwaarden | How to get the most from your fit numbers |
| Text | Hoi {voornaam}, drie tips bij je belangrijkste waarden: [rijen: zadelhoogte, terugstand, drop] ✓ Zadelhoogte is je startpunt. Rijd er een paar ritten mee voordat je verder bijstelt. ✓ Terugstand bepaalt waar je knie boven het pedaal staat, afgestemd op je rijstijl. ✓ Drop maakt je sneller (meer) of comfortabeler (minder), afgestemd op jouw doel. Voelt iets na een paar ritten nog niet goed? Je stappenplan zegt wat je dan probeert. | Hi {firstName}, three tips for your key numbers: [rows] ✓ Saddle height is your starting point. Ride a few times before adjusting further. ✓ Setback sets where your knee sits over the pedal, matched to your riding style. ✓ Drop makes you faster (more) or more comfortable (less), matched to your goal. Still something off after a few rides? Your plan tells you what to try next. |
| Button | Bekijk mijn fitwaarden | View my fit numbers |

### New · Day 1: tips and app (service, with unsubscribe link)
Send 24 h after sign-up, once per user, via a new cron in the same style as the existing lifecycle mails.
| | NL | EN |
|---|---|---|
| Subject | 3 tips voor een fit die echt klopt | 3 tips for a fit that's spot on |
| Preheader | Nauwkeuriger meten in 5 minuten, plus je fit altijd op zak. | Measure more accurately in 5 minutes, and keep your fit in your pocket. |
| Heading | 3 tips voor een fit die echt klopt | 3 tips for a fit that's spot on |
| Intro | Hoi {voornaam}, hoe preciezer je meet, hoe beter je advies. Met deze drie tips haal je het meeste uit BestBikeFit4U: | Hi {firstName}, the more precisely you measure, the better your advice. These three tips help you get the most out of BestBikeFit4U: |
| Tip 1 | **Meet op blote voeten.** Zet een boek tussen je benen, strak tegen de muur, en meet van de vloer tot de bovenkant. Meet twee keer: een paar millimeter scheelt al in je zadelhoogte. | **Measure barefoot.** Hold a book between your legs, flat against the wall, and measure from the floor to the top. Measure twice: a few millimetres already changes your saddle height. |
| Tip 2 | **Wees eerlijk over je lenigheid.** Kom je niet bij je tenen? Vul dat gewoon in. Dan krijg je een houding die je ook na 100 km nog prettig vindt. | **Be honest about your flexibility.** Can't reach your toes? Just say so. You'll get a position that still feels good after 100 km. |
| Tip 3 | **Pas één ding tegelijk aan.** Stappen van 2 tot 5 mm, en test elke aanpassing een paar ritten. Zo weet je precies wat werkt. | **Change one thing at a time.** Steps of 2 to 5 mm, and test each change for a few rides. That way you know exactly what works. |
| Button | Start mijn fit (or "Bekijk mijn fit" if a fit exists) | Start my fit (or "View my fit" if they already have one) |
| App block | TIP · Zet BestBikeFit4U op je telefoon. Je waarden altijd bij de hand: in de schuur met de inbussleutel in je hand, of bij de pomp voor je rit. Geen App Store nodig, en het neemt bijna geen ruimte in. [chips: Je afstelwaarden · Je bandenspanning · Je stappenplan] iPhone: 1. Open bestbikefit4u.eu in Safari 2. Tik op het deelicoon 3. Kies Zet op beginscherm · Android: 1. Open bestbikefit4u.eu in Chrome 2. Tik op de drie puntjes 3. Kies App installeren | TIP · Put BestBikeFit4U on your phone. Your numbers always at hand: in the shed with the Allen key in your hand, or at the pump before your ride. No App Store needed, and it takes up almost no space. [chips: Your fit numbers · Your tyre pressure · Your plan] iPhone: 1. Open bestbikefit4u.eu in Safari 2. Tap the share icon 3. Choose Add to Home Screen · Android: 1. Open bestbikefit4u.eu in Chrome 2. Tap the three dots 3. Choose Install app |

Precondition: the site is installable as a web app (manifest with icons). If missing, report and add it.

### Day 7 and day 14 — only if the app has a check-in and a progress view
Lead finding: no check-in / progress feature exists in the app → **skip, report in the PR**.

## 6. Unsubscribe and preferences
- Transactional, no unsubscribe link: 1, 2, 3, 4 and 6.
- Service and marketing, with unsubscribe link: day 1, 7, 8, 9, 10.
- Add `emailPreferences` (or similar) to the user, with a simple preferences page that works in both languages.
- Send `List-Unsubscribe` and `List-Unsubscribe-Post` headers (one-click).
- Crons skip users who unsubscribed.

## 7. Test and deliver
- Previews: a script or route rendering every mail in NL and EN with sample data (Lisa Jansen, Canyon Endurace, saddle height 754 mm, test range 731–774, setback 49, drop 98, stem 100 mm · −6°, crank 172,5, handlebar width 420, frame size XL, 90%). Screenshots of all mails go with the PR.
- Unit tests for `resolveEmailLocale` (all three steps), number and date formatting per language, and a check that every key exists in both languages.
- Language-switch test: set a test user to EN, trigger a cron mail, switch to NL and trigger again. The second mail must be Dutch.
- Only send to a test address or sandbox. Do not enable crons for real users.
- PR description: what changed, assumptions, what differed from the brief, and what is still open.

## Not in scope
- Aligning the names "Fit Pass" and "Pro": leave them as they are in the copy.
- The 200–500 users per cron-run batch limit: note as open item, don't change.
- Mail 5 (internal): new layout only, text stays Dutch.
