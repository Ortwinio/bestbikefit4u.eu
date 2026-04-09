# Step 2: Shared Slider And Color Strategy

## Objective

Define the implementation strategy for reusing dashboard-style sliders and calculator colors on the marketing site without introducing duplicated UI logic.

## Tasks

1. Decide whether each dashboard pattern should be:
   - shared directly
   - extracted into a common component
   - wrapped in a public-safe adapter
   - recreated only if the dashboard implementation is too coupled
2. Define a single slider system for public calculator use cases:
   - ordinal question sliders
   - continuous number sliders
   - read-only result sliders if needed
3. Define the shared color contract for calculator UI:
   - card backgrounds
   - slider tracks and thumbs
   - focus states
   - helper/info text
   - safe/warning/result emphasis
4. Identify any token changes needed in `src/app/globals.css`.
5. Identify any component moves needed from dashboard-specific folders into shared folders.

## Output

Create `output-02-shared-slider-color-strategy.md`.

## Success Criteria

- The plan does not create two competing slider systems for equivalent calculator behavior.
- Shared ownership of components is explicit.
- Color alignment is defined as tokens/semantics, not vague styling direction.
