# Claude Instructions

This file contains instructions for Claude when working in this repository. It supplements `AGENTS.md` with Claude-specific guidance.

## Project: BikeFit AI

AI-powered bike fitting application. Users input body measurements and riding preferences, answer a dynamic questionnaire, and receive personalized bike fit recommendations.

### Stack

- **Next.js 16** (App Router, `src/` directory, Turbopack)
- **Convex** (backend-as-a-service: schema, mutations, queries, actions)
- **@convex-dev/auth** (passwordless magic-code auth via Resend)
- **Tailwind CSS** (styling)
- **TypeScript** (end-to-end, Convex codegen for type safety)

### Key Architectural Decisions

- All data flows through Convex typed RPC — no REST endpoints, no raw fetch calls
- Auth uses `ConvexAuthNextjsServerProvider` with server-side route protection via `src/proxy.ts`
- Security headers (CSP, X-Frame-Options, etc.) configured in `next.config.ts`
- Backend authorization uses `requireUserId()` / `requireXOwner()` pattern in `convex/lib/authz.ts`

## First Steps

When starting a session:

1. **Check messages** — Read `messages/` for any open questions or blockers
2. **Check context** — Look in `context/INDEX.md` for active reference materials
3. **Understand the task** — Ask clarifying questions if the request is ambiguous

## Directory Quick Reference

| Directory | Purpose | In Git? |
|-----------|---------|---------|
| `context/` | User-provided reference files | README + INDEX only |
| `plans/` | Project plans and prompts | Yes (all files) |
| `messages/` | Agent communication | README + TEMPLATE only |

## Planning Work

When asked to plan a feature or project:

1. Create a folder in `plans/` with a clear name
2. Write a README with:
   - Goal
   - Background (if needed)
   - Scope and out-of-scope
   - Approach
   - Acceptance criteria
3. Create numbered prompt files (`01-*.md`, `02-*.md`, ...)
4. Each prompt should be self-contained — another agent should be able to execute it without additional context

## Executing Plans

When working from an existing plan:

1. Read the plan README first
2. Execute prompts in order
3. If blocked, post to `messages/` and skip to the next prompt if possible
4. Update the plan README with progress notes

## Communication

### Asking Questions

Save as `messages/question-<topic>.md`:

```markdown
# Question: [Topic]

**From**: Claude
**Date**: YYYY-MM-DD HH:MM
**Status**: Open

## Question

[Your question here]
```

### Reporting Blockers

Save as `messages/blocked-<topic>.md`:

```markdown
# Blocked: [Topic]

**From**: Claude
**Date**: YYYY-MM-DD HH:MM
**Status**: Open

## Blocker

[What's blocking you]

## Attempted

[What you tried]

## Needed

[What would unblock you]
```

### Cleanup

Delete your messages from `messages/` once resolved.

## Code Style

- Follow existing patterns in the codebase
- Write clear, readable code
- Add comments only where the logic isn't obvious
- Prefer simple solutions over clever ones
- Use Convex `v.` validators for all mutation/query args
- Use the `requireUserId()` / `requireXOwner()` auth pattern for new endpoints

## Commits

When asked to commit:
- Write concise commit messages focusing on what changed and why
- Group related changes together
- Don't commit `.env` files or secrets
