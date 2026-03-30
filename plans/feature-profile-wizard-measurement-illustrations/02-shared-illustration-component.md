# Step 02: Shared Illustration Component

## Task
Create a reusable measurement illustration component/config for the wizard.

## Target Files
- `src/components/measurements/`

## Requirements
- Add one shared component for rendering:
  - optional illustration
  - alt text
  - caption or helper line if needed
- Add one centralized mapping/config object for measurement assets
- Use `next/image`
- Keep the component optional-safe so fields without images render cleanly
- Preserve current wizard visual language

## Non-goals
- Do not change validation logic
- Do not change backend code
- Do not add images to measurements that lack a real asset

## Acceptance
- Step files can consume a single shared illustration contract
- No repeated hardcoded `/measure/*.png` paths are spread across multiple files
- Missing-image fields do not need special ad hoc markup in every step
