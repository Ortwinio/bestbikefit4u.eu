# Agent Guide

This document explains how to work within this repository structure. Read this before starting any task.

## Repository Layout

```
├── context/          # Reference materials (not in git)
├── plans/            # Project plans and prompts (in git)
├── messages/         # Agent communication (not in git, except README)
├── convex/           # Convex backend (schema, mutations, queries, actions)
├── src/              # Next.js frontend (App Router)
├── AGENTS.md         # This file
├── CLAUDE.md         # Claude-specific instructions
└── README.md         # Human-readable overview
```

## Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Backend**: Convex (real-time BaaS)
- **Auth**: @convex-dev/auth (passwordless magic code via Resend)
- **Styling**: Tailwind CSS
- **Language**: TypeScript end-to-end

## Working with Context

The `context/` directory contains reference materials the user has provided. Check it at the start of each session:

1. List the directory contents
2. Read `context/INDEX.md` for what's currently active
3. Read files relevant to your task
4. Use this information to inform your work

Context files are temporary. Don't assume they'll exist in future sessions.

## Working with Plans

Plans live in `plans/`. Each project has its own folder:

```
plans/my-feature/
├── README.md           # Plan overview (goal, scope, status)
├── 01-first-step.md    # Sequential prompts
├── 02-second-step.md
└── output-01-*.md      # Deliverables from each step
```

### Executing a Plan

1. Read the project README to understand scope
2. Work through prompts in order
3. Complete each prompt fully before the next
4. If blocked, post to `messages/` and continue if possible
5. Update the plan README with progress after each step

### Creating a Plan

When the user asks you to plan work:

1. Create a folder in `plans/` with a descriptive name (prefix: `feature-`, `bugfix-`, `refactor-`)
2. Write a README with goal, scope, approach, and acceptance criteria
3. Break the work into numbered prompt files (`01-*.md`, `02-*.md`, ...)
4. Each prompt should be a standalone task another agent can execute

## Working with Messages

The `messages/` directory is for agent-to-agent communication.

### File Naming

`YYYYMMDD-HHMM-<from>-to-<to>-<topic>.md`

Example: `20260215-1400-claude-to-user-auth-question.md`

### Message Types

- **Questions**: `question-*.md` — When you need input
- **Blockers**: `blocked-*.md` — When you cannot proceed
- **Info**: `info-*.md` — Sharing information others might need

### Check for Messages

At session start:
1. List `messages/` contents
2. Read any open messages
3. Respond if you can help resolve something

### Resolve Messages

When your question is answered or blocker is cleared:
1. Delete the message file
2. Keep this directory clean

## Multi-Agent Coordination

### Before Starting Work
- Check `messages/` for relevant open items
- Read any active plans in `plans/`
- Look at recent git commits to see what others have done

### During Work
- Post blockers immediately
- Share information others might need
- Don't duplicate work another agent is doing

### Handoffs
When passing work to another agent:
1. Commit your changes
2. Update the plan README with progress
3. Post a message summarizing state and next steps

## File Conventions

### What Goes in Git
- All source code (`src/`, `convex/`)
- `plans/` (all files)
- `AGENTS.md`, `CLAUDE.md`, `README.md`
- `context/README.md`, `context/INDEX.md`
- `messages/README.md`, `messages/TEMPLATE.md`

### What Stays Local
- `context/*` (except README and INDEX)
- `messages/*` (except README and TEMPLATE)

## Session Checklist

Start of session:
- [ ] Check `messages/` for open items
- [ ] Check `context/INDEX.md` for reference materials
- [ ] Review active plans if continuing previous work

End of session:
- [ ] Commit completed work
- [ ] Update plan progress if applicable
- [ ] Post handoff message if work continues
- [ ] Delete any resolved messages you posted
