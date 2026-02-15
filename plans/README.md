# Plans Directory

This directory contains project plans. Each project gets its own folder with a structured breakdown of what needs to be built and the prompts to build it.

## Structure

```
plans/
├── README.md (this file)
├── feature-user-auth/
│   ├── README.md          # Plan overview (goal, scope, status)
│   ├── 01-first-step.md   # Sequential prompts
│   ├── 02-second-step.md
│   └── output-01-*.md     # Deliverables from each step
└── bugfix-checkout-flow/
    ├── README.md
    └── 01-fix-validation.md
```

## Creating a New Plan

### 1. Create a project folder

Name it descriptively. Prefix helps identify the work type: `feature-`, `bugfix-`, `refactor-`, `security-`.

### 2. Write the plan README

The project README should contain:

- **Goal**: What you're building or fixing
- **Background**: Why this work is needed
- **Scope**: What's included and what's not
- **Approach**: High-level strategy
- **Dependencies**: What needs to exist first
- **Acceptance criteria**: How to know when it's done
- **Status**: Current step and owner

### 3. Create numbered prompt files

Break the work into sequential prompts (`01-*.md`, `02-*.md`, ...). Each prompt file should be a self-contained task that an agent can execute.

## Writing Prompts

A prompt file should include:

```markdown
# Task Title

## Objective
What this step achieves.

## Inputs
Files and context needed.

## Tasks
1. Specific work items.

## Deliverable
What the agent should produce.

## Completion Checklist
- [ ] Items to verify before moving on.
```

## Rules

- Run prompts in order.
- Update status at the end of each prompt.
- Do not skip steps without writing why in the README.

## Archiving Completed Plans

When a plan is finished, either:
- Delete the folder if the prompts have no reuse value
- Keep it for reference (mark as complete in the README)
