# Prompt 04 — Improve page

## Goal

Create `/profile/improve/comfort` — a targeted guide explaining how to address common sources of cycling discomfort, following the same pattern as the flexibility and core-stability improve pages.

---

## Context

Read `plans/feature-comfort-discomfort-card/README.md` first.

Reference files:
- `src/app/(dashboard)/profile/improve/flexibility/page.tsx`
- `src/app/(dashboard)/profile/improve/core-stability/page.tsx`
- `src/components/profile/ProfileImproveGuideClient.tsx`

---

## New file: `src/app/(dashboard)/profile/improve/comfort/page.tsx`

Use `ProfileImproveGuideClient` with `variant="comfort"`. Provide exercises/tips that target each major pain area:

### Exercises

**Saddle area**
- Name: "Saddle height adjustment check"
- Detail: "Saddle height is the single most common cause of cycling discomfort. Too high causes rocking and perineal pressure; too low overloads the knee."
- Cadence: "Check every time you change bikes or shoes"
- Steps:
  1. Sit on the bike with the pedal at the 6 o'clock position and your heel on it.
  2. Your leg should be fully extended without hip rocking.
  3. With the ball of your foot on the pedal, you should have a slight bend (25–35°).

**Knee — front**
- Name: "Lower your saddle slightly"
- Detail: "Front knee pain (anterior) is almost always caused by a saddle that is too low, overloading the patellar tendon."
- Cadence: "Raise saddle 2–3 mm at a time, wait 2 rides before adjusting again"
- Steps:
  1. Raise the saddle 2 mm and do a 30-minute test ride.
  2. Continue raising in 2 mm increments until the pain reduces.
  3. Stop before hip rocking appears.

**Knee — back**
- Name: "Lower your saddle slightly"
- Detail: "Posterior knee pain is caused by a saddle that is too high, overstretching the hamstring attachment at the back of the knee."
- Cadence: "Lower saddle 2–3 mm at a time, wait 2 rides before adjusting again"
- Steps:
  1. Lower the saddle 2 mm and do a 30-minute test ride.
  2. Continue lowering in 2 mm increments until the pain reduces.
  3. Stop if hip closure becomes too great at the top of the pedal stroke.

**Lower back**
- Name: "Shorten or raise your handlebar setup"
- Detail: "Lower back pain is typically caused by excessive reach (too long a stem) or excessive drop (bars too low), forcing the lumbar spine to overextend."
- Cadence: "Adjust once per week maximum; allow 2 rides to adapt after each change"
- Steps:
  1. Try a shorter stem (10–20 mm shorter) or raise the bar stack with spacers.
  2. On the bike, check that your lower back remains neutral — not rounded and not over-arched.
  3. Strengthen the core in parallel (see Core Stability card) to support the position.

**Neck and shoulders**
- Name: "Raise handlebar height"
- Detail: "Neck and shoulder tension arises when bars are too low or too far away, forcing you to crane your neck upward for long periods."
- Cadence: "Raise bars 5–10 mm at a time and ride for a week before adjusting again"
- Steps:
  1. Add a spacer beneath the stem or flip the stem to a positive rise.
  2. Ensure your elbows are slightly bent (not locked) in your natural riding position.
  3. Consider a shorter stem if reach feels excessive.

**Hands**
- Name: "Redistribute weight off the hands"
- Detail: "Hand numbness and pain usually means too much weight is loaded onto the bars — often caused by bars that are too low, too far away, or a weak core that can't support the torso."
- Cadence: "Assess over 2–3 rides after each change"
- Steps:
  1. Raise the bars to reduce the amount of forward lean.
  2. Shorten the stem if reach is excessive.
  3. Use padded gloves and ergonomic grips or bar tape as a short-term measure.

**Feet**
- Name: "Move cleats back toward the heel"
- Detail: "Hot foot and forefoot numbness is caused by cleats positioned too far forward, compressing the metatarsal nerves under load."
- Cadence: "Move 2–3 mm at a time; allow a full week to adapt"
- Steps:
  1. Loosen the cleat bolts and slide the cleat toward the heel.
  2. The ball of your foot should sit just in front of or directly over the pedal axle.
  3. Check that the shoe is wide enough — narrow shoes compress the forefoot under power.

### Progress tips

```
"Most fit issues improve within 2–4 rides after a single adjustment — avoid changing multiple things at once.",
"Keep a simple ride log: note what you changed, how far you rode, and whether discomfort changed.",
"If pain persists after 3–4 weeks of incremental adjustments, consider a professional bike fit.",
"Re-rate your comfort level in your profile after any significant fit change.",
```

---

## i18n title key

Add to `profile.improve` in both `en.ts` and `nl.ts`:

```ts
comfort: {
  title: "How to improve your riding comfort",
}
```

```ts
comfort: {
  title: "Hoe verbeter je je rijcomfort",
}
```

---

## Verification

- Page renders at `/[locale]/profile/improve/comfort`
- All 7 pain-area exercises display correctly
- Progress tips render
- Page title matches metadata
- No TypeScript errors
