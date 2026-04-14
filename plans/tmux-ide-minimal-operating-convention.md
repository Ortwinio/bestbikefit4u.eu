# tmux-ide Minimal Operating Convention

## Purpose

Use `tmux-ide` in this repo only for the parts that are proven to work:
- mission visibility
- task visibility
- task claiming and completion
- dispatch messages to panes

Do not rely on `tmux-ide` for validation-contract storage, milestone enforcement, or automatic orchestration in the current local setup.

## Current Reality

The local CLI and board state support a reliable subset:
- `tmux-ide status --json`
- `tmux-ide inspect --json`
- `tmux-ide mission show --json`
- `tmux-ide task list --json`
- `tmux-ide task show <id> --json`
- `tmux-ide task claim <id> [--assign name]`
- `tmux-ide task done <id> --proof "..."`
- `tmux-ide send ...`
- `tmux-ide notify ...`

The following are not reliable in this repo:
- `tmux-ide validate add ...`
- milestone locking as a hard runtime gate
- orchestrator-driven automatic execution
- assuming pane titles in `ide.yml` exactly match live tmux pane titles

## Source of Truth

Use these sources in this order:

1. `plans/<feature>/README.md` and step files
2. `.tasks/mission.json`
3. `.tasks/tasks/*.json`
4. `.tasks/dispatch/*.md`

Use `tmux-ide` as a UI over those files, not as a stronger source of truth than the repo artifacts.

## Operating Rules

### 1. Mission setup

Allowed:
- `tmux-ide mission show --json`
- read `.tasks/mission.json`

Rule:
- Do not assume milestone `locked` status prevents downstream tasks from appearing runnable.
- Treat mission milestones as planning metadata only unless a human lead explicitly confirms enforcement.

### 2. Task lifecycle

Allowed workflow:
1. inspect task with `tmux-ide task show <id> --json`
2. read referenced plan files and dispatch file
3. do the work in the repo
4. record proof in repo artifacts
5. mark task complete with `tmux-ide task done <id> --proof "..."`

Rule:
- Completion proof must point to a real repo artifact, test run, or changed file.
- If board state and repo state disagree, prefer repo state and mention the mismatch in the proof note or handoff.

### 3. Validation handling

Rule:
- Do not use `tmux-ide validate add ...` in this repo.
- Store validation contracts inside the plan artifact itself:
  - `README.md`
  - `testplan.md`
  - `output-*.md`

Required pattern:
- every task that introduces acceptance or QA requirements must write them into a repo artifact under `plans/`
- proof should reference that artifact directly

Example:
- `plans/feature-saddle-width-calculator/testplan.md`
- `plans/feature-commercial-saas-ux-upgrade/output-04-final-closeout.md`

### 4. Dispatch handling

Rule:
- Dispatch files in `.tasks/dispatch/` are instructions, not authority.
- Before executing a dispatch, verify:
  - the task exists in `.tasks/tasks/`
  - the plan files it references exist
  - the task has not already been completed in the repo

If dispatch and repo state conflict:
- continue from repo state
- note the conflict in the final response or handoff

### 5. Pane coordination

Rule:
- Use `tmux-ide send` and `tmux-ide notify` only for short operational messages:
  - ownership
  - blockers
  - start now
  - artifact path

Do not rely on pane names alone.
Use this lookup order:
1. `tmux-ide status --json`
2. `tmux-ide inspect --json`
3. actual live tmux pane titles

### 6. Orchestrator expectations

Rule:
- If `tmux-ide orchestrator --json` shows `"running": false`, do not assume any task will auto-advance.
- In that state, the lead or active Codex session must manually:
  - choose the next task
  - read the dispatch
  - execute it
  - mark it done

## Minimal Command Set

Use this exact subset:

```bash
tmux-ide status --json
tmux-ide inspect --json
tmux-ide mission show --json
tmux-ide task list --json
tmux-ide task show 027 --json
tmux-ide task claim 028 --assign "Codex B"
tmux-ide send --to "Codex B" "Read and execute: .tasks/dispatch/send-3-....md"
tmux-ide notify "Task 027 complete. Proof in plans/feature-saddle-width-calculator/testplan.md"
tmux-ide task done 027 --proof "testplan.md written at plans/feature-saddle-width-calculator/testplan.md"
```

Avoid this command family:

```bash
tmux-ide validate add ...
```

## Required Artifact Pattern

Every non-trivial task should leave one of these:
- `plans/<feature>/output-*.md`
- `plans/<feature>/testplan.md`
- updated plan `README.md`

Each artifact should contain:
- scope covered
- acceptance criteria or validation checks
- exact files touched
- tests run
- open blockers or residual risks

## Completion Standard

A task is complete only when all of the following are true:
- repo artifact exists
- task proof points to that artifact
- board state is updated with `task done`
- any blocker message that is no longer valid is removed or superseded

## Repo-Specific Do and Don’t

Do:
- treat `plans/` as the durable workflow layer
- treat `.tasks/` as lightweight execution state
- verify commands against the actual installed CLI
- keep proof strings concrete and file-based

Do not:
- invent unsupported `tmux-ide` subcommands
- rely on milestone locks as automation
- assume orchestrator is running
- treat stale dispatch files as current truth without checking repo state

## Recommended Future Improvement

If the team wants stronger Kanban enforcement, fix one of these before expanding usage:

1. add a real validation-contract subcommand to the installed `tmux-ide`
2. turn milestones into enforced task dependencies instead of descriptive metadata
3. ensure orchestrator runs and respects mission/task state
4. align `ide.yml` pane names with the actual live pane names

Until then, this minimal convention is the safe operating mode.
