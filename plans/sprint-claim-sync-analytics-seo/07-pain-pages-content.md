# T08 — First 5 pain pages (content)

**Ticket:** T08
**Effort:** 2 developer-days (copy + wiring)
**Depends on:** T07 (template), T05 (sitemap)

---

## Context

These five pages target the highest-intent symptom queries for cycling. Each page follows the template defined in T07. Copy below is production-ready — wire it directly into `PAIN_PAGES` in `src/app/(public)/pain/data.ts`.

**Canonical strategy reminder (from T07):**
- Keep existing pain guides (`/guides/bike-fitting-for-knee-pain`, `/guides/bike-fitting-for-lower-back-pain`)
- Do not redirect them to the new pain pages
- Cross-link: guide → pain page ("quick symptom check"), pain page → guide ("full methodology")

---

## Page 1: Knee Pain While Cycling

```ts
{
  slug: "knee-pain-cycling",
  symptom: "knee pain",
  metaTitle: "Knee Pain While Cycling: Position Fixes | BestBikeFit4U",
  metaDescription: "Cycling knee pain is usually position-related. Check saddle height, setback, and cleat offset before changing anything else. Practical steps inside.",
  keywords: ["cycling knee pain", "knee pain on bike", "bike fitting knee pain", "saddle height knee pain"],
  h1: "Knee Pain While Cycling: What Your Position Might Be Doing",
  intro: "Most cycling knee pain has a position cause. Here is how to check the most likely culprits before you change equipment or take time off the bike.",
  mechanismHeading: "What usually causes knee pain on a bike",
  mechanisms: [
    {
      heading: "Saddle too low — anterior knee pain",
      body: "A saddle that is too low increases knee flexion at the bottom of the pedal stroke. The quads and patellar tendon work harder than necessary, causing discomfort at the front of the knee. This is the most common cause of knee pain in cyclists who set their saddle by feel rather than measurement.",
    },
    {
      heading: "Saddle too high — posterior knee pain",
      body: "An excessively high saddle causes the hips to rock or the leg to reach at the bottom of the stroke. This strains the posterior knee structures — hamstring tendons and the back of the joint. You may also notice hip rocking as a clue.",
    },
    {
      heading: "Saddle setback mismatch — lateral knee pain",
      body: "If the saddle is too far forward relative to the bottom bracket, the knee tracks ahead of the pedal at the power phase of the stroke. This can load the iliotibial band and lateral knee. Setback is often overlooked after saddle height is corrected.",
    },
    {
      heading: "Cleat rotation — medial or lateral knee stress",
      body: "Cleats fixed in a position that does not match your natural foot angle force the knee to rotate through each stroke. Even a few degrees of misalignment repeated thousands of times per hour accumulates into inflammation. Float cleats compensate for minor misalignment.",
    },
  ],
  fitCheckHeading: "What to check first",
  fitCheckSteps: [
    {
      step: 1,
      heading: "Set saddle height from inseam",
      body: "Measure your inseam barefoot (book between legs, floor to top of book). Multiply by 0.883 for a road starting point. This gives you the floor-to-top-of-saddle measurement. Adjust in 3 mm increments — not 15 mm at once.",
      calculatorLink: {
        href: "/calculators/saddle-height",
        label: "Use the saddle height calculator",
      },
    },
    {
      step: 2,
      heading: "Check setback with a plumb line",
      body: "With your pedals at 3 and 9 o'clock (horizontal), a plumb line from the front of your kneecap should pass through or just behind the pedal axle. If it falls significantly in front, move the saddle back. If it falls far behind, move it forward.",
    },
    {
      step: 3,
      heading: "Check cleat position and float",
      body: "The cleat should position the ball of your foot over or just behind the pedal axle. For rotation, stand naturally, look at where your feet point, and set the cleat angle to match. If you are not sure, switch to float cleats (red Look, yellow Shimano, blue Speedplay) to give your knee room to find its natural path.",
    },
    {
      step: 4,
      heading: "Make one change at a time and test for 3 rides",
      body: "The most common mistake after identifying a knee pain cause is changing too many things at once. Change saddle height, ride three times, assess. Only then move to setback or cleats. This way you know what actually worked.",
    },
  ],
  faqs: [
    {
      q: "Can a bike fit fix all cycling knee pain?",
      a: "Position adjustments resolve most cycling-specific knee discomfort because they remove the repeated mechanical stress. If pain is present off the bike, is acute, or does not improve after position corrections, the cause may be structural — see a physiotherapist or sports medicine specialist.",
    },
    {
      q: "What is the single most important thing to change first?",
      a: "Saddle height. It has the largest effect on knee angle through the pedal stroke and is the most commonly misconfigured dimension on a cyclist's bike. Start there before touching setback or cleats.",
    },
  ],
  relatedLinks: [
    { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
    { href: "/calculators/bike-fit", label: "Full Bike Fit Calculator" },
    { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain — full guide" },
  ],
},
```

---

## Page 2: Lower Back Pain Cycling

```ts
{
  slug: "lower-back-pain-cycling",
  symptom: "lower back pain",
  metaTitle: "Lower Back Pain While Cycling: Position Fixes | BestBikeFit4U",
  metaDescription: "Lower back pain on a bike is often caused by cockpit length, bar drop, or saddle tilt. Check these before raising your bars or stopping riding.",
  keywords: ["cycling lower back pain", "back pain on bike", "bike fitting back pain", "cycling cockpit reach"],
  h1: "Lower Back Pain While Cycling: What to Check Before Anything Else",
  intro: "Lower back pain while cycling is one of the most common fit complaints. It is almost always related to cockpit length, bar drop, or saddle position — all of which are adjustable.",
  mechanismHeading: "What usually causes lower back pain on a bike",
  mechanisms: [
    {
      heading: "Cockpit too long",
      body: "When you have to reach too far to the bars, the lower spine extends and the lumbar muscles work continuously to hold the position. Over the course of a long ride they fatigue, and the pain builds from the mid-back down. Reach is more often the cause of back pain than bar height.",
    },
    {
      heading: "Too much bar drop",
      body: "Excessive drop forces the pelvis into a posterior tilt to flatten the lower back. This compresses the lumbar discs and strains the erector muscles. The body compensates by rounding the lower back, which is exactly what you want to avoid.",
    },
    {
      heading: "Saddle tilt causing pelvic forward rotation",
      body: "A saddle nose angled downward pushes the rider forward, increasing the effective reach and loading the arms and lower back to compensate. A slightly nose-up tilt can push on soft tissue. Neutral (0° or very slightly nose-down, max −2°) is the correct starting point.",
    },
    {
      heading: "Core fatigue at longer distances",
      body: "Even a well-fitted position will cause back discomfort if the core is not adapted to holding it. Back pain that only appears after 90+ minutes, early in a training block, or after a long winter break is usually an adaptation issue rather than a fit issue.",
    },
  ],
  fitCheckHeading: "What to check first",
  fitCheckSteps: [
    {
      step: 1,
      heading: "Measure your effective reach",
      body: "The horizontal distance from the saddle nose to the centre of the bar top is your effective reach. If this is longer than your torso + arm calculation suggests, start by shortening the stem or moving the saddle forward before raising the bars.",
      calculatorLink: {
        href: "/calculators/bike-fit",
        label: "Calculate your reach target",
      },
    },
    {
      step: 2,
      heading: "Check bar drop",
      body: "Measure the vertical drop from the top of your saddle to the top of your bar (hoods position). A road bike at a comfortable position typically has 30–60 mm of drop for most riders. If you have more, raise the bars one spacer before touching reach.",
    },
    {
      step: 3,
      heading: "Set saddle tilt to neutral",
      body: "Use a spirit level or phone level app on the saddle. Set it to 0° or very slightly nose-down (no more than −2°). Do not tilt the nose down to relieve soft tissue pressure — that shifts the problem to your arms and back.",
    },
    {
      step: 4,
      heading: "Rebuild intensity gradually",
      body: "After making changes, reduce ride duration by 30% for two weeks. Back pain caused by position needs the tissue to adapt to the new position, not just the removal of the old stress. Jumping straight back to full volume often causes the same pain to return.",
    },
  ],
  faqs: [
    {
      q: "Should I always raise my handlebars when I have back pain?",
      a: "Not necessarily. Raising the bars reduces drop but does not change reach. If reach is too long, raising the bars makes the position more upright but does not remove the lumbar extension. Check reach first, then adjust bar height as needed.",
    },
    {
      q: "How quickly should back pain improve with a better position?",
      a: "Postural fatigue from a slightly wrong position typically improves within a few rides once the position is corrected. Persistent or acute back pain that does not improve within two to three weeks of position correction warrants assessment by a physiotherapist.",
    },
  ],
  relatedLinks: [
    { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
    { href: "/guides/bike-fitting-for-lower-back-pain", label: "Bike Fitting for Lower Back Pain — full guide" },
    { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
  ],
},
```

---

## Page 3: Hand Numbness Cycling

```ts
{
  slug: "hand-numbness-cycling",
  symptom: "hand numbness",
  metaTitle: "Hand Numbness While Cycling: Position Fixes | BestBikeFit4U",
  metaDescription: "Hand numbness on a bike is usually caused by too much weight on the hands. Check reach, bar drop, and hood position before buying new gloves or bar tape.",
  keywords: ["cycling hand numbness", "numb hands cycling", "hand pain on bike", "cycling reach bar drop"],
  h1: "Hand Numbness While Cycling: Too Much Weight on the Hands",
  intro: "Numb or tingling hands on a bike are almost always a sign that too much weight is bearing down through the palms. The fix is a position change, not new gloves.",
  mechanismHeading: "What usually causes hand numbness on a bike",
  mechanisms: [
    {
      heading: "Too much reach, too much weight on the hands",
      body: "When the reach is too long, the rider leans forward to hold the bars and transfers bodyweight through the arms. Sustained pressure on the ulnar nerve (running through the heel of the palm) causes numbness in the ring and little fingers. Sustained pressure on the median nerve causes numbness in the index and middle fingers.",
    },
    {
      heading: "Excessive bar drop",
      body: "Too much drop creates the same forward weight transfer as too much reach. The rider is effectively falling forward and catching themselves with their hands. Reducing drop so the rider can sit into the position without bearing down resolves this.",
    },
    {
      heading: "Bar width too narrow for shoulder width",
      body: "Bars narrower than shoulder width create internal rotation of the shoulder, which tenses the muscles from shoulder to wrist and increases pressure at the contact point. A bar width matched to shoulder width allows the arm to hang more naturally.",
    },
    {
      heading: "Hood position too far forward or rotated down",
      body: "If the brake hood is swept too far forward on a drop bar, the wrist must extend to reach it, compressing the carpal tunnel. Hoods should be set so the wrist is neutral when riding on the hoods — a straight line from forearm to knuckle.",
    },
  ],
  fitCheckHeading: "What to check first",
  fitCheckSteps: [
    {
      step: 1,
      heading: "Shorten reach first",
      body: "Reduce reach before touching bar height. Fit a shorter stem (try 10–20 mm shorter) or move the saddle slightly forward if setback allows. This should reduce the forward weight transfer noticeably within the first ride.",
      calculatorLink: {
        href: "/calculators/bike-fit",
        label: "Calculate your reach target",
      },
    },
    {
      step: 2,
      heading: "Reduce bar drop",
      body: "Add a spacer under the stem to raise the bar by 10–15 mm. The goal is a bar height where you can put weight through your sit bones rather than your hands while riding on the hoods.",
    },
    {
      step: 3,
      heading: "Check bar width against shoulder width",
      body: "Measure shoulder width (acromion to acromion, the bony tips of the shoulders). Road bar width in cm should be close to this measurement. If your bars are more than 20 mm narrower than your shoulder width, try wider bars.",
    },
    {
      step: 4,
      heading: "Rotate the hoods to neutral wrist",
      body: "Sit on the bike in your normal position. Look at your wrist on the hoods. If it is flexed downward or extended upward, rotate the hood until the wrist is neutral (straight forearm-to-knuckle line). This is a 10-minute adjustment with an Allen key and is often overlooked.",
    },
  ],
  faqs: [
    {
      q: "Is cycling hand numbness always a fit problem?",
      a: "Usually yes, if it appears consistently after 30–60 minutes of riding. Numbness that starts immediately, is present off the bike, or affects an entire hand rather than specific fingers may indicate a nerve compression issue unrelated to bike position — worth discussing with a doctor.",
    },
    {
      q: "Will gel gloves or thicker bar tape fix the numbness?",
      a: "Padding helps reduce vibration fatigue in the short term but does not address the weight distribution that causes nerve compression. Fix the position first. Padding is a useful addition after that, not a substitute.",
    },
  ],
  relatedLinks: [
    { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
    { href: "/calculators/frame-size", label: "Frame Size Calculator" },
    { href: "/use-cases/endurance-cycling-fit", label: "Endurance Cycling Fit" },
  ],
},
```

---

## Page 4: Neck and Shoulder Pain Cycling

```ts
{
  slug: "neck-shoulder-pain-cycling",
  symptom: "neck and shoulder pain",
  metaTitle: "Neck and Shoulder Pain Cycling: Position Fixes | BestBikeFit4U",
  metaDescription: "Cycling neck and shoulder pain usually comes from holding your head up against too much bar drop. Check reach, drop, and bar width before stopping riding.",
  keywords: ["cycling neck pain", "shoulder pain cycling", "neck pain on bike", "cycling bar drop reach"],
  h1: "Neck and Shoulder Pain While Cycling: How Position Loads Your Upper Body",
  intro: "Neck and shoulder pain on a bike is almost always a consequence of the rider holding their head up against a position that is too aggressive or too long. The muscles fatigue, and the pain builds from the base of the skull down.",
  mechanismHeading: "What usually causes neck and shoulder pain on a bike",
  mechanisms: [
    {
      heading: "Too much bar drop — head held up against gravity",
      body: "Every 10 mm of bar drop adds measurable load to the neck extensors. At 80–120 mm of drop, a recreational rider's neck muscles are working at their limit within an hour. The classic symptom is pain that starts in the upper traps and spreads to the base of the skull by the end of the ride.",
    },
    {
      heading: "Too much reach — sustained forward lean",
      body: "Reach that is longer than the rider's torso and arm proportions support forces a forward lean that the neck must compensate for by lifting the head further back. Reducing reach is often more effective than raising the bars for neck pain.",
    },
    {
      heading: "Bar width too narrow — shoulder tension",
      body: "Narrow bars create internal shoulder rotation. The tension generated travels up the trapezius into the neck. Riders who have switched from a narrow road bar to a wider gravel bar often report that shoulder pain they attributed to position was actually bar width.",
    },
    {
      heading: "Lever angle requiring head tilt",
      body: "Brake levers set too far forward or at an angle that requires the rider to look down and tilt their head to check traffic can accumulate into neck strain on longer rides.",
    },
  ],
  fitCheckHeading: "What to check first",
  fitCheckSteps: [
    {
      step: 1,
      heading: "Reduce bar drop",
      body: "Add one or two stem spacers to raise the bar. The target is a bar height where you can maintain a relaxed neck with your chin slightly tucked rather than craned up. A 10–15 mm raise is often enough to relieve the symptom.",
      calculatorLink: {
        href: "/calculators/bike-fit",
        label: "Calculate your bar drop target",
      },
    },
    {
      step: 2,
      heading: "Shorten reach",
      body: "If neck pain persists after raising the bars, check reach. A shorter stem (10–20 mm) reduces the forward lean and therefore reduces how high the neck must extend. This is often a more effective fix than bar height alone.",
    },
    {
      step: 3,
      heading: "Check bar width",
      body: "Measure shoulder width (acromion to acromion). Road bar width should be within 10–20 mm of this measurement. If your bars are significantly narrower, try wider bars on a test ride. The shoulder relaxation is often immediately noticeable.",
    },
    {
      step: 4,
      heading: "Adjust lever angle",
      body: "Sitting on the bike in your normal riding position, your wrists should be in neutral — no upward or downward extension — when holding the hoods. Rotate levers until this is achieved. The change also reduces the head angle needed to look forward.",
    },
  ],
  faqs: [
    {
      q: "Why does my neck hurt more on longer rides?",
      a: "The neck extensors are working isometrically (holding a fixed position) for the entire ride. Like any muscle held under sustained load, they fatigue over time. The pain appears as the muscles can no longer maintain the position. Reducing drop and reach reduces the effort required, which pushes the fatigue threshold out further into the ride.",
    },
    {
      q: "Does bar width matter for neck pain?",
      a: "Yes, more than most riders expect. Narrow bars create internal shoulder rotation that tenses the upper trapezius — the muscle that connects shoulder to neck. Riders who switch to a bar width matched to their shoulders often report a reduction in neck tension within the first ride.",
    },
  ],
  relatedLinks: [
    { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
    { href: "/use-cases/endurance-cycling-fit", label: "Endurance Cycling Fit" },
    { href: "/use-cases/gravel-cycling-fit", label: "Gravel Cycling Fit" },
  ],
},
```

---

## Page 5: Saddle Pain and Discomfort

```ts
{
  slug: "saddle-pain-cycling",
  symptom: "saddle pain",
  metaTitle: "Saddle Pain While Cycling: Position Fixes | BestBikeFit4U",
  metaDescription: "Saddle pain on a bike is usually about height, tilt, or setback — not the saddle itself. Check position before buying a new saddle.",
  keywords: ["saddle pain cycling", "cycling saddle discomfort", "saddle soreness bike", "saddle height tilt setback"],
  h1: "Saddle Pain While Cycling: Check Position Before Changing Saddles",
  intro: "Saddle discomfort is one of the most common reasons cyclists stop riding. In most cases, the saddle itself is not the problem — height, tilt, and setback are.",
  mechanismHeading: "What usually causes saddle pain on a bike",
  mechanisms: [
    {
      heading: "Saddle too high — rocking and soft tissue pressure",
      body: "A saddle that is too high causes the hips to rock side to side at the bottom of the pedal stroke. This rocking shifts weight from sit bones to soft tissue with each stroke, causing chafing and pressure on areas that are not designed to bear load.",
    },
    {
      heading: "Saddle too low — sit bone compression",
      body: "A low saddle means the rider sits with a more closed hip angle, compressing the sit bones and perineum harder into the saddle. The position also prevents efficient power transfer, so the rider sits heavier rather than driving through the pedals.",
    },
    {
      heading: "Saddle tilt off neutral",
      body: "A nose-up tilt directs pressure onto soft tissue and perineal structures. A nose-down tilt shifts the rider forward, increasing weight on the hands and causing the rider to push back against the saddle nose throughout the stroke. Neutral (0° to −2° maximum nose-down) is the starting point for almost everyone.",
    },
    {
      heading: "Setback placing the rider on the wrong part of the saddle",
      body: "If the saddle is too far forward, the rider sits on the nose rather than the wider sit bone region. If too far back, the rider slides forward to find their natural balance point, which achieves the same result. Correct setback keeps the rider centred on the widest part of the saddle.",
    },
  ],
  fitCheckHeading: "What to check first",
  fitCheckSteps: [
    {
      step: 1,
      heading: "Set saddle height from measurement",
      body: "Measure inseam (barefoot, book between legs, floor to top of book). Multiply by 0.883 for a road starting point. Adjust from this baseline rather than from feel or a shop default.",
      calculatorLink: {
        href: "/calculators/saddle-height",
        label: "Use the saddle height calculator",
      },
    },
    {
      step: 2,
      heading: "Set tilt to neutral",
      body: "Use a phone level app. Set the saddle to 0°. Ride for three sessions. Only adjust if neutral causes discomfort that a truly neutral tilt cannot explain. Maximum nose-down adjustment for relief is −2°. Do not go further without a good reason.",
    },
    {
      step: 3,
      heading: "Check setback with a plumb line",
      body: "Pedals at 3 and 9 o'clock (horizontal). A plumb line from the front of your kneecap should pass through or just behind the pedal axle. This roughly positions the saddle so you are sitting on the designed part of it.",
    },
    {
      step: 4,
      heading: "Saddle width consideration",
      body: "Saddle width should match sit bone width. Most bike shops can measure sit bone width with a foam pad or pressure-mapping tool. A saddle that is too narrow concentrates load on the sit bones; too wide causes inner thigh chafing. This is the one variable where the saddle choice matters — but get position right first.",
    },
  ],
  faqs: [
    {
      q: "Will a new saddle fix my saddle pain?",
      a: "A saddle that is the wrong width for your sit bone distance will cause pain regardless of position. But most saddle pain is caused by height, tilt, or setback — and a new saddle on a misconfigured bike will cause the same discomfort as the old one. Set position correctly first, then assess whether saddle width or shape is the remaining issue.",
    },
    {
      q: "How much tilt is actually correct?",
      a: "The starting point for almost every rider is 0° (level). A slight nose-down tilt of up to −2° is acceptable if the level position causes perineal pressure. Going further nose-down shifts weight forward and trades perineal pressure for hand and arm load. Nose-up tilt is almost never correct for a cycling saddle.",
    },
  ],
  relatedLinks: [
    { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
    { href: "/calculators/bike-fit", label: "Full Bike Fit Calculator" },
    { href: "/use-cases/back-pain-cycling", label: "Back Pain While Cycling" },
  ],
},
```

---

## Wiring into `data.ts`

Place all five objects in the `PAIN_PAGES` array in `src/app/(public)/pain/data.ts`. The order determines nothing (pages are accessed by slug) but by convention list them most-searched-first.

---

## Acceptance criteria

- [ ] All five pages render at their defined slugs with zero runtime errors
- [ ] Each page includes: hero, mechanism section, fit check (numbered steps), disclaimer, FAQ, CTA card, related links
- [ ] Every numbered fit check step that references a calculator includes a working link
- [ ] Meta titles are under 60 characters (verify all five)
- [ ] Meta descriptions are 140–160 characters (verify all five)
- [ ] `FitDisclaimer` is rendered on every page above the bottom CTA
- [ ] All five slugs appear in `sitemap-pain.xml`
- [ ] Cross-links exist: knee-pain page links to `/guides/bike-fitting-for-knee-pain` and vice versa

## Edge cases

- The lower-back page (`lower-back-pain-cycling`) overlaps most with `/guides/bike-fitting-for-lower-back-pain`. Add a `<Link>` in the guide's Related Links pointing to the pain page to establish the cross-link before both are indexed.
- No page should use the phrase "this will fix your pain" or imply a guaranteed outcome. Review all `a` fields in `faqs` for unqualified health claims.

## Human audit checklist

- [ ] Read each page as if you have the described symptom — does the content feel useful and honest?
- [ ] Check every calculator link on mobile — confirm tap targets are large enough
- [ ] Verify disclaimer text appears between the fit check and the FAQ on every page
- [ ] Search Google for the primary keyword of each page 48 hours after deploy — confirm the page is indexed
