# Step 03: Shell Token Migration

## Objective

Fix the shell-level token and dark/light mode issues called out in the audit.

## Scope

- auth layout
- public header/footer/mobile menu/language switch
- dashboard sidebar and surrounding shell containers
- any shared global token classes directly involved in those shells

## Requirements

- remove hardcoded light-only palette assumptions where possible
- prefer semantic token usage over raw `gray/*`, `blue/*`, `white`, etc.
- preserve current information architecture and layout behavior

## Deliverables

- shell styling updated to semantic token usage
- dark/light mode behavior validated in shared shells
- short output note listing shell files touched and notable token decisions

## Verification

- targeted `eslint`
- `npx tsc --noEmit --pretty false`
- `npm run build:vercel`
