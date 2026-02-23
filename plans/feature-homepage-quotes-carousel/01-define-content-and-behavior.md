# Step 01 - Define Content and Behavior

## Objective
Lock the quote dataset and exact behavior contract before implementation.

## Tasks
1. Create a canonical quotes array (20 items) in a dedicated module (for example `src/content/homeQuotes.ts`).
2. Use exactly the following quotes:
   - "A few millimeters of change, and pedaling suddenly felt smoother and more efficient."
   - "Back pain used to cut my rides short. Now I can ride for hours without thinking about it."
   - "My hands stopped going numb on longer rides."
   - "The comfort difference was immediate, even though the adjustments were small."
   - "A different saddle and the right saddle height brought the fun back into riding."
   - "Seeing the measurements made the choices clear, and I could feel the result right away."
   - "My cleat position was off. Fixing it took pressure off my knees and feet."
   - "What felt like a minor issue became a big problem on long rides. Now it’s solved."
   - "The advice was practical: measure, adjust, test, and confirm."
   - "I run slightly different cleat setups for my road shoes and my gravel shoes now."
   - "I can hold a more aerodynamic position without discomfort."
   - "Climbing feels easier because I’m not fighting my posture anymore."
   - "Descents feel more controlled because my weight is better balanced."
   - "No more stiff neck after an hour. I can keep my head up comfortably."
   - "My hips track straighter and my pedal stroke feels more even."
   - "I’d recommend a proper fit to anyone who rides regularly. It’s worth it."
   - "I used to guess. Now I know my numbers and I can repeat the setup consistently."
   - "A yearly check makes sense-your body and training change over time."
   - "It was easier to understand than I expected, and I could apply it the same day."
   - "Going into my big ride, I felt ready because the bike finally fit me."
3. Define and document randomization rules:
   - Select 4 unique quotes each visit.
   - No duplicates within one 4-quote set.
   - If randomness runs client-side, use an initial-safe render strategy to avoid hydration mismatch.
4. Decide section copy (title/subtitle) and whether it should be localized or fixed English.
5. Produce a short output artifact with chosen rules and file locations.

## Deliverable
- `plans/feature-homepage-quotes-carousel/output-01-content-and-behavior.md`

## Done When
- Quote source is finalized.
- Randomization behavior is unambiguous.
- Team has a clear implementation contract for Step 02.

