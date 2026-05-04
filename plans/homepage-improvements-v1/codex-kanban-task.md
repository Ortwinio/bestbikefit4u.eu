# Codex Task — Update kanban board for homepage-improvements-v1

## Context

The project uses a file-based kanban board in `.tasks/`. The board has:
- `.tasks/mission.json` — the active mission (single file)
- `.tasks/tasks/*.json` — individual task files, numbered sequentially

The current mission (`mission.json`) covers "CMS Guide Pages" and its last task is `054` (status: done). A new plan has been created: `plans/homepage-improvements-v1/` with 5 prompts (01–05).

The current highest task number in `.tasks/tasks/` is `054`. New tasks start at `055`.

## What to do

### 1. Create 5 new task files in `.tasks/tasks/`

One file per prompt. Use the schema from an existing task file as reference (e.g. `.tasks/tasks/054-*.json`). Required fields: `_version`, `id`, `title`, `description`, `status`, `priority`, `goal`, `created`, `updated`, `tags`, `proof`, `milestone`, `specialty`, `depends_on`, `assignee`, `retryCount`, `maxRetries`, `lastError`, `nextRetryAt`, `fulfills`, `discoveredIssues`, `salientSummary`.

| File | id | title | depends_on | specialty | status |
|------|----|-------|------------|-----------|--------|
| `055-homepage-remove-bike-sections.json` | `055` | Remove BikeQuickCheckCard and BikeSearchBar sections from homepage | `[]` | `frontend` | `todo` |
| `056-footer-bike-passport-entry.json` | `056` | Add compact bike passport entry to footer Calculators column | `["055"]` | `frontend` | `todo` |
| `057-calculator-logo-colours.json` | `057` | Differentiate CalculatorLogo colour per calculator using oklch palette | `[]` | `frontend` | `todo` |
| `058-stepper-visual-upgrade.json` | `058` | Enlarge and colourise stepper step visuals to 72px with per-step accent colours | `[]` | `frontend` | `todo` |
| `059-fix-differentiator-placeholder-copy.json` | `059` | Replace internal placeholder description in DifferentiatorTriple with real product copy | `[]` | `frontend` | `todo` |

Use goal `"11"` for all 5 tasks (new goal number for this initiative).

For each task's `description` field, copy the relevant content summary from the corresponding plan prompt file (e.g. `plans/homepage-improvements-v1/01-remove-sections.md`).

Set `created` and `updated` to `"2026-05-04T10:00:00.000Z"`.

### 2. Update `.tasks/mission.json`

Add a new milestone at the end of the `milestones` array:

```json
{
  "id": "M5",
  "title": "Homepage improvements v1",
  "tasks": ["055", "056", "057", "058", "059"],
  "status": "todo"
}
```

Update the top-level `updated` field to `"2026-05-04T10:00:00.000Z"`.

Do NOT change anything else in `mission.json`.

## Verification

- 5 new files exist in `.tasks/tasks/`, named correctly.
- `.tasks/mission.json` has milestone M5 with the 5 task ids.
- All new JSON files are valid (no syntax errors).

## Done

Commit with message: `Add homepage-improvements-v1 tasks to kanban board (055–059, milestone M5)`
