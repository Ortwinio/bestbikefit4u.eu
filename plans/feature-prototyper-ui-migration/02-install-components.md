# 02 — Install Prototyper UI Component Source Files

## Goal

Pull the Prototyper UI source files for all required components into the project using the CLI. After this step the component source exists in the repo but the old custom components are still in place — nothing is wired up yet.

## Background

Prototyper UI uses a "copy" model (like shadcn/ui): `npx @prototyperai/cli add <component>` writes component source files into your project. The default output path should target a staging area or directly `src/components/ui/` — confirm the CLI's output path before running.

Use `mcp__prototyper-ui__get_install_command` to retrieve the exact CLI invocation for each component.

## Components to Install

Run the CLI for each of these components. Check the install command tool for the exact invocation:

- `button`
- `input`
- `label`
- `select`
- `card`
- `dialog`
- `tooltip`
- `progress`

You can install multiple at once if the CLI supports it:

```bash
npx @prototyperai/cli add button input label select card dialog tooltip progress
```

Or use `get_install_command` with `"button,input,label,select,card,dialog,tooltip,progress"` to get the exact command.

## Steps

1. Use `mcp__prototyper-ui__get_install_command` to get the exact install command for all 8 components.
2. Run the command.
3. Confirm which files were written and where. The CLI may place them in `src/components/ui/` or a subdirectory.
4. Do NOT delete or modify the existing custom component files yet — they'll be replaced in subsequent prompts.
5. If there are naming conflicts (e.g., a `Button.tsx` already exists), the CLI may prompt to overwrite or place files elsewhere — note what happened.

## Acceptance Criteria

- [ ] Prototyper UI source files for all 8 components are present in the project
- [ ] File locations are documented (add a note to this file or the README)
- [ ] Existing custom components are still intact
- [ ] No TypeScript errors introduced by the new files
