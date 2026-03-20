# Step 05 — Improvement Guide Pages

## Goal

Create two static informational pages that help cyclists understand what their current score means for their bike fit and what they can do to improve it.

## Routes

- `/profile/improve/flexibility` → `src/app/(dashboard)/profile/improve/flexibility/page.tsx`
- `/profile/improve/core-stability` → `src/app/(dashboard)/profile/improve/core-stability/page.tsx`

Both pages live inside the `(dashboard)` layout — they get the sidebar, header, and auth protection automatically.

## Page Structure (Both Pages)

Each guide page follows this structure:

```
[Back to Profile] link at the top

Hero section:
  - Title: "Improve Your Flexibility" / "Improve Your Core Stability"
  - Subtitle: why this matters for bike fitting
  - Your current score chip (queried from Convex)

What your score means:
  - A card per level showing the typical cycling position it allows
  - Current level highlighted

Exercises section:
  - 3-5 exercises with: name, illustration placeholder, sets/reps/duration, step-by-step instructions
  - Organised from beginner-friendly to more advanced

Progress tips:
  - How often to train
  - When to retest
  - "When you feel ready, update your score →" button linking back to the profile with edit mode open

```

## Flexibility Guide Content

File: `src/app/(dashboard)/profile/improve/flexibility/page.tsx`

### Why It Matters (intro section)

Hamstring and lower back flexibility directly determines how low and far forward you can comfortably position your upper body on the bike. A limited flexibility score results in a more upright position — which is more comfortable but less aerodynamic. Improving flexibility allows you to ride in a more efficient, powerful position over time.

### What Each Level Means for Your Fit

| Level | Position Implication |
|---|---|
| Very Limited | Upright position; large bar drop not possible; short reach |
| Limited | Moderate drop possible; medium reach |
| Average | Standard sportive position; typical road geometry fits well |
| Good | Aggressive position possible; suitable for gran fondo and race geometry |
| Excellent | Full race position; minimal bar drop; maximum aerodynamic efficiency |

### Exercises

1. **Seated hamstring stretch** (daily)
   - Sit on the floor, legs straight
   - Reach forward and hold for 30 seconds
   - 3 sets, daily
   - Progress: each week try to reach slightly further

2. **Standing forward fold** (daily)
   - Stand with feet shoulder-width
   - Hinge at hips, let arms hang
   - Hold 30-60 seconds
   - Keep knees soft, not locked

3. **Supine hamstring stretch with strap** (3x/week)
   - Lie on your back
   - Loop a towel or strap around one foot
   - Pull gently toward ceiling, hold 30 seconds each side

4. **Pigeon pose** (3x/week, post-ride)
   - Hip flexor and hip rotator opener — indirect support for pelvic tilt on the bike
   - Hold 60 seconds per side

5. **Hip hinge drill** (2x/week)
   - Practice hinge pattern with neutral spine — teaches the movement pattern needed for an aggressive riding position
   - 3 sets of 10 reps

### Progress Tips

- Stretch daily for 6-8 weeks to see a meaningful change
- Retest every 4 weeks: sit on the floor with legs straight and see how far you reach
- When you can clearly reach one level further, update your profile score

### "Update My Score" CTA

```tsx
<Link href={withLocalePrefix("/profile", locale)}>
  <Button>
    {messages.profile.improve.updateScoreCta}
  </Button>
</Link>
```

---

## Core Stability Guide Content

File: `src/app/(dashboard)/profile/improve/core-stability/page.tsx`

### Why It Matters (intro section)

Core stability determines how long you can sustain an aggressive, forward-leaning riding position without fatiguing your lower back and shoulders. Low core stability means the engine (your legs) works well but the chassis (your torso) gives out — leading to back pain, hand pressure, and early fatigue. A stronger core allows more reach and lower handlebars without discomfort.

### What Each Level Means for Your Fit

| Level | Plank Hold | Position Implication |
|---|---|---|
| 1 – Very Low | < 20 sec | Very upright; limited reach; short stem recommended |
| 2 – Low | 20-40 sec | Moderate upright; medium reach |
| 3 – Average | 40-60 sec | Standard road position; typical reach |
| 4 – Good | 60-90 sec | Aggressive position possible; lower bar drop |
| 5 – Excellent | 90+ sec | Full performance position; maximum reach and drop |

### Exercises

1. **Front plank** (3x/week)
   - Forearms and toes, straight line from head to heel
   - Hold to form failure
   - 3 sets; log your time; aim to add 5 seconds each week
   - This is your retest movement

2. **Dead bug** (3x/week)
   - Lie on your back, arms up, knees at 90°
   - Slowly lower opposite arm/leg, keep lower back pressed to floor
   - 3 sets of 10 reps per side
   - Excellent for cycling-specific core control

3. **Bird dog** (3x/week)
   - On hands and knees, extend opposite arm and leg
   - Hold 3 seconds, return
   - 3 sets of 10 reps per side

4. **Side plank** (2x/week)
   - On forearm and outer edge of foot
   - Hold 30 seconds each side
   - Improves lateral stability needed for powerful pedalling

5. **Glute bridge** (3x/week)
   - Lie on back, feet flat, lift hips
   - Hold 2 seconds at top, lower slowly
   - 3 sets of 15 reps
   - Strengthens posterior chain: glutes + lower back

### Progress Tips

- Train core 3x per week on non-consecutive days
- The front plank is your retest: retest every 4 weeks
- When your plank hold consistently reaches the next tier, update your profile score
- Combine with on-bike fitness: longer rides build endurance core stability naturally

### "Update My Score" CTA

Same pattern as the flexibility page.

---

## Implementation Notes

- Both pages are server components (no `"use client"` needed) unless the current score query requires client-side Convex
- If showing the current score from Convex: use `useQuery` — add `"use client"` and use the same auth-aware pattern as other dashboard pages
- The exercise content can be written directly as JSX (no markdown rendering needed)
- No new Convex queries are needed beyond reading the user's `profile`

## i18n Keys Needed (Step 06 will add them)

```
profile.improve.flexibility.title
profile.improve.flexibility.subtitle
profile.improve.flexibility.whatItMeansTitle
profile.improve.flexibility.exercisesTitle
profile.improve.flexibility.progressTitle
profile.improve.flexibility.updateScoreCta
profile.improve.flexibility.backLink

profile.improve.coreStability.title
profile.improve.coreStability.subtitle
profile.improve.coreStability.whatItMeansTitle
profile.improve.coreStability.exercisesTitle
profile.improve.coreStability.progressTitle
profile.improve.coreStability.updateScoreCta
profile.improve.coreStability.backLink
```

> Exercise content (exercise names, descriptions, sets/reps) can be hard-coded in the component or stored as i18n arrays. Given the length, hard-coding in JSX with a note to localise later is acceptable for the first version.

## Acceptance Criteria

- [ ] `/profile/improve/flexibility` renders within the dashboard layout
- [ ] Page shows the user's current flexibility score (from Convex)
- [ ] "What each level means" table is present with the current level highlighted
- [ ] At least 4 exercises are described with instructions
- [ ] Progress tips section explains how often to retest
- [ ] "Update my score" CTA links back to the profile page
- [ ] `/profile/improve/core-stability` has the same structure with plank-focused content
- [ ] Both pages have proper `<title>` metadata (via Next.js `metadata` export or `generateMetadata`)
- [ ] Back to profile link is present on both pages
- [ ] Pages render correctly in dark mode
