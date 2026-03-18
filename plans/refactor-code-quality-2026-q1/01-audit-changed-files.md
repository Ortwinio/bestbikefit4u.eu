# Step 01 — Audit Changed Files

## Objective

Review all files modified or added since the Round 1 quality plan (`e79b451`) for TypeScript issues, lint violations, and obvious code quality problems.

## Files to Audit

Changed since Round 1 (from git status + recent commits):

**UI components (Prototyper UI migration):**
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Tooltip.tsx`
- `src/components/ui/States.tsx`
- `src/components/ui/FieldLabel.tsx`
- `src/components/ui/AccessibleDialog.tsx`
- `src/components/ui/Progress.tsx` (new)
- `src/components/ui/index.ts`
- `src/app/globals.css`

**Feature files:**
- `src/components/questionnaire/ProgressBar.tsx`
- All files touched in tire pressure module (`04b47ef`)
- All files touched in dashboard upgrade (`d7f66cc`)
- GTM consent implementation (`0288595`)

**Package changes:**
- `package.json` / `package-lock.json` — check for unwanted deps or version issues

## Tasks

1. Read each UI component file; note any:
   - Missing or wrong TypeScript types
   - Props not matching usage in consumer components
   - Unused imports or variables
   - Inconsistent `className` merging or missing `cn()` usage
   - Any `any` types that could be tightened

2. Run `npx tsc --noEmit 2>&1` and capture output

3. Run `npm run lint 2>&1` and capture output

4. Check `src/components/ui/index.ts` exports match all files in the directory

## Output

Document findings in `output-01-audit-changed-files.md`:
- List of type/lint issues found, grouped by file
- P0 (blocks build), P1 (wrong type, potential runtime bug), P2 (style/lint)
- Count of `any` types introduced
- Missing exports
