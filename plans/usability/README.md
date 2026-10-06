# Release: Usability-advies BikeFitBoost v2 + canvas "BikeFitBoost redesign" (ronde 3, 6 okt)

Owner request (6 Oct): implement the usability advice v2 and **check during the build that the usability rules are followed**; follow
the redesign on the Claude canvas "BikeFitBoost redesign". Worktree `/Users/ortwinverreck/Developer/bikefitboost-usability`, branch
`feature/usability-v2` (from main @ 903ecb2; reliability release is live). Absolute paths only; git only as
`git -C /Users/ortwinverreck/Developer/bikefitboost-usability`. No commits, deploys, prod data, env changes or real mails.
Never commit logs, renders, crawl/domain JSON.

**Sources (authoritative):** `usability-advies-v2.md` (findings, two routes, reason per calculator, text collapsing, paid moments,
backlog 1–8 with acceptance criteria, and the **15 rules** in "Toetsing van het ontwerp") and every board in `canvas/project/`
(115 boards, pages Website / Fitrapport / E-mails / Riderprofiel / Abonnement afsluiten; mobile boards in `canvas/project/m/`,
checkout in `canvas/project/afsluiten/`, mails in `canvas/project/mail/`, new `Vertrekmelding.dc.html`, `Calculator.dc.html` is the
shared calculator template, `Bandenspanning.dc.html` the shared tyre-pressure component). Where advice and canvas differ, the canvas
(round 3) wins and you note it. Run the boards' scripts for states. Keep everything the reliability release delivered (ranges, data
reuse, leave notice) — the canvas builds on it.

## The 15 usability rules = release gate
1 account reason + next step directly under the result, own text per calculator (table in the advice; button names the benefit) ·
2 explanation after the result collapsed (calculators + 13 guide/pain/explainer pages; open: heading, short answer ≤2 sentences,
safety, next step; collapsed text stays in the server HTML) · 3 two routes "Mijn houding" (5) and "Mijn rit" (6) with progress
"Mijn houding · 2 van 5", prefilled values chip "Uit je eerdere invoer" and a "We kennen al: … · wijzig" strip · 4 homepage: routes as
two start buttons, all 11 calculators within one click, saddle widget as live · 5 mobile header one row ≤ 64 px (logo, Inloggen/avatar,
44×44 menu button); calculator tab bar moves into the menu/route progress; cookie banner never covers header or tab bar ·
6 paid visible at the natural limits (second bike, profile score 80 %, step plan, compare, report, history) with one sentence + price ·
7 paid in several different forms ("Betaald ±" chip at the result, ladder, locked preview, locked 20 % of the score, compare strip) ·
8 untouched default values grey with label "voorbeeld" and one line "Voorbeeld voor iemand van 190 cm · schuif naar jouw maat";
gone after touching; reused values are never an example · 9 numbers only with a slider (frame size and cassette in the bike form too);
text fields only for names, URLs, codes · 10 measured/estimated: the logical choice preselected, never an empty choice · 11 tyre pressure
everywhere through one component (front lime, rear ink) on all 10 screens; mails show "5,2 bar · 75 psi" as text · 12 no pop-ups,
countdowns or fear for paid; the leave notice is about saving data, once per session · 13 safety information always visible
(saddle height, Quick fix, tyre pressure) · 14 only real features and current prices (€21,50 / €13,50 / €9,50 / €234,50 / €209,50; no
€24,50, €19,50, "€5 korting"); a reason for an account that is not live yet waits · 15 tap targets ≥ 44 px and contrast ≥ 4,5:1
(3:1 large text).
Plus backlog acceptance: account block within 1 screen under the result value at 390 px; old button "Bewaar en verfijn gratis" gone;
mobile calculator page ≤ 7 screens; a reason already shown to this visitor is not shown again on the next calculator (session).

## Tasks
| ID | Owner | Scope |
|---|---|---|
| **U1 usability guard + homepage + mobile header + QA** | A | First build `scripts/usability-check.mjs` (+ tests): runs against a local production build (offline Convex) in Playwright at 390×844 and 1440×900, NL/EN, over all 11 calculators, homepage, pricing, the 13 collapsed content pages, login, dashboard/profile/bikes/settings fixtures and checkout steps, and reports **per rule 1–15** pass/fail with evidence (positions in screens, header height, page length in screens, tap-target sizes, contrast via axe, forbidden strings, example labels, number inputs that are not sliders, server-HTML presence of collapsed text, no upgrade overlays). Rules that need judgement are listed as manual checks with screenshots. Publish it early in `messages/A-guard.md` so B and C run it **during** their work; every DONE requires a green guard for the owner's scope. Then homepage (backlog 4, Main + m/Home boards) and the one-row mobile header (backlog 5) on all pages, and the final combined gates. |
| **U2 calculator journey** | B | `Calculator.dc.html` template on all 11 calculators + saddle height + tyre pressure: backlog 1 (reason + next step under the result, per-calculator texts and buttons from the advice table, original promise line "Wat je hier invult nemen we mee."), 2 (collapse; also the 13 guide/pain/explainer pages), 3 (two routes, progress, "We kennen al" strip with wijzig, next-step card opening the next calculator prefilled), 7 (example values), 8 (don't repeat a shown reason this session), rule 13 safety. Check each reason against what the account does today (rule 14); unreleased ones wait and are listed. |
| **U3 account + paid moments + forms** | C | Backlog 6 / rules 6–7 on Dashboard, Profile, ProfileImprove, Bikes/BikeAdd/BikeForm/BikeProfile/BikeCompare, FitResults/FitReport, History, Pricing and `afsluiten/*` per the round-3 boards; rule 9 (bike form frame size + cassette as sliders), rule 10 (measured/estimated preselected in profile, welcome, account saddle height, mobile bike fit), rule 11 (one tyre-pressure component on all 10 screens, mails as text), rule 14 (prices and real features only), the e-mail boards that changed in round 3 (previews only). |

Open owner decisions (keep the canvas as designed, list them in notes, do not invent): seat setback has no paid range ("In je
stappenplan"); 2 gift measurements per year at the €9,50 upgrade; refund on cancellation only after a renewal; A4 report shows tyre
pressure per surface as a difference.

Coordination via `plans/usability/messages/`; disjoint files; A's guard first. Use subagents in parallel.
Final gates (A): typecheck, lint, test:unit, test:contracts, Convex tsc, build (`NEXT_PUBLIC_SITE_URL=https://bikefitboost.com`, offline
Convex), `scripts/seo-crawl-check.mjs --local` (collapsed text must not reduce indexable content), `scripts/domain-migration-check.mjs
https://bikefitboost.com https://bestbikefit4u.eu --local`, email previews, **usability guard all 15 rules green**. Notes
`plans/usability/audit/U<n>-notes.md`. Print `DONE U1` / `DONE U2` / `DONE U3`.

## U1 completion — 6 October

### Owner bar follow-up — 7 October

DONE U1-BAR. Owner bar corrections `6d4c2a43` are included in frozen final15 `jytw4ikWvOEcr_Thl1YBK`. All 15 rules pass with the narrow rule12 owner exception, 332 cases, 1,476 manual checks and six surface attestations. All combined gates pass. Consent-visible bar, menu, footer, session dismissal and blocked-storage Close are covered; homepage length is reported without a new threshold. Exact results and limitations: `messages/A-guard-final15.md`, `audit/U1-notes.md`. No bar behaviour changes by A, commits or deploys.

### Earlier final14 candidate

DONE U1. Final frozen build `A-_g2mE1fYoPQrVxnnicS`: all combined gates pass,332 NL/EN390/1440 cases,1476 manual checks and6 pressure surfaces. Strict finalization reports all15 rules green, `releasePassed:true`, no outstanding manual checks and no errors. Evidence: `renders/guard/final14/reviewed-report.md`; scope, limitations and manifest: `audit/U1-notes.md`, `audit/files-U1.txt`. Public pressure remains under7 screens in both mobile locales with visible safety and server-rendered disclosure text. This is local Codex validation, not deployment or human approval. No commits/deploys/production changes/real mails.
