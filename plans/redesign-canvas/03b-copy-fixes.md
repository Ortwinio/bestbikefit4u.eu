# 03b — Copy fixes for the existing boards (Codex A) — lead QA finding

The lead QA on 03 found that **internal/developer language has ended up in rider-facing copy**. A board shows the copy the real site will show. The comments in `renderVals()` are for developers; the visible text is for riders (`reference/brand.md` → Tone of voice: concrete, honest, informal "je", no jargon).

## Remove or rewrite (all occurrences, in markup AND in strings from `renderVals()`)

| Found | Problem | Direction |
|---|---|---|
| "engineband", "groen = engineband" | jargon | "veilige marge" / "groen = veilige marge" |
| "voorlopig rekenvoorbeeld", "openbaar rekenvoorbeeld", "Dit blijft een rekenvoorbeeld" | meta talk about the mockup | remove; an honest limit stays, as rider copy: "Een sterk startpunt — test het op je fiets." |
| "voorlopige shortlist", "Voorlopige startwaarde" | "voorlopig" means something else to a rider | "Je shortlist", "Je startwaarde" |
| "Openbare startvolgorde; … geen engineband. Je volledige accountplan …" | internal | "Begin hier. In je account krijg je het volledige plan: eerst cleats, dan zadelhoogte, setback, drop en stuurpen." |
| "Dit is een uitbreiding uit de accountengine", "de volledige accountengine verwerkt …" | internal | "In je account rekenen we ook met nat weer, karkas en velgbreedte." |
| "[ENGINEWAARSCHUWINGEN] … geen veiligheidsvrijgave" | placeholder in jargon | "Controleer altijd de maximale druk op je band en velg (hookless!)." plus placeholder `[WAARSCHUWINGEN UIT JE ACCOUNT]` |
| "Google-aanmelding is hier een voorbeeld. De echte app opent Google; dit canvas logt je niet in." and other demo texts | meta talk about the mockup | remove completely; the board simply shows the real UI |
| "Voorlopige invoerkwaliteit op basis van herkomst, … geen fitgarantie." | jargon | "Hoe nauwkeuriger je meet, hoe scherper je advies." |
| "Voorbeeldmaten; pas ze aan." | fine, but short and friendly | "Voorbeeldmaten — schuif ze naar jouw maten." |

Check every board for more cases with: `engine|contract|voorlopig|demo|canvas|placeholder|adapter|guardrail|board|integratie|rekenvoorbeeld` (case-insensitive) in the visible text. The only allowed hits are the `// VOORLOPIGE REKENREGEL` comments.

## Also
- Remove the unused handler `setSurface` from `drafts/TirePressure.dc.html` (`check-runtime.mjs` flags it).
- Make sure no text overflows after the changes (same height per artboard).

## Renders for the lead's visual QA
Save a PNG per draft to `drafts/_renders/<Name>.png` at 1440 wide, using your local headless render (the same one you used before). Use the real Google Fonts if the network allows it, otherwise fallback fonts (and say so). Do this for BikeFit, SaddleHeight, FrameSize, TirePressure (options expanded) and Login (both the email state and the code state: `Login-email.png`, `Login-code.png`).

## Done when
- The jargon grep gives 0 hits in visible text.
- `check-board.mjs` and `check-runtime.mjs` PASS with no "handler not bound".
- The renders are in `drafts/_renders/`.

Print `DONE 03b` as your last line.
