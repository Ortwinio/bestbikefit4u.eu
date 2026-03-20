# 02 — Install Actual Prototyper UI Source Files

## Goal

Use the Prototyper CLI to copy the real component source into the repo. After this step, the project contains the actual Prototyper source files needed for the migration instead of relying on local reimplementations.

## Background

This is the main missing piece in the current migration. The repo currently has Base UI wrappers and custom primitives, but not the copied Prototyper source itself. Do not skip this by hand-porting code unless the CLI is blocked.

## Components to Install

Required install set:

- `button`
- `input`
- `label`
- `select`
- `card`
- `dialog`
- `tooltip`
- `progress`

Preferred command:

```bash
npx @prototyperai/cli add button input label select card dialog tooltip progress
```

## Steps

1. Retrieve or confirm the exact CLI install command for the required components.
2. Run the CLI in a way that preserves visibility into which files were created.
3. Confirm the file output locations and naming.
4. If there are name collisions with existing files in `src/components/ui/`, use a temporary landing zone or staged rename strategy rather than blindly overwriting.
5. Record exactly which generated files will become the new source of truth for each UI primitive.

Preferred outcome:

- copied Prototyper source is present in the repo
- existing app imports are not switched yet
- follow-up prompts can now wrap or replace the old files deliberately

## Acceptance Criteria

- [ ] Prototyper UI source files for all 8 components are present in the project
- [ ] File locations are documented in the README or prompt notes
- [ ] Existing custom components are not blindly destroyed during install
- [ ] No TypeScript errors introduced by the new files
