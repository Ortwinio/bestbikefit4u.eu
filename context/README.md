# Context Directory

This folder holds reference materials for your current work session. Drop files here that agents need to understand your project: documentation, specifications, design files, screenshots, or any other relevant context.

## How to Use This Directory

1. **Add files** — Copy or drag files into this folder before starting a session
2. **Update INDEX.md** — Keep `INDEX.md` pointing to what's currently active
3. **Reference them** — Point agents to specific files when asking questions
4. **Clean up** — Remove files when they're no longer needed

## What to Put Here

- API documentation and specs
- Design mockups and wireframes
- Database schemas
- Architecture diagrams
- Screenshots of bugs or UI issues
- Example code from other projects
- Meeting notes or requirements documents

## For Agents

When a user references "context" or points you to this directory:

1. Read `INDEX.md` first to see what's active
2. Read the relevant files to understand the current task
3. Use this information to inform your responses
4. Ask for clarification if the context is incomplete or unclear

Files here are temporary working materials. They are excluded from version control (except README and INDEX), so treat them as ephemeral reference material rather than permanent project documentation.

## File Organization

Keep files organized by naming them descriptively:

```
context/
├── README.md
├── INDEX.md
├── api-spec-v2.yaml
├── login-flow-mockup.png
└── requirements-phase1.md
```

No strict structure is required. Use whatever organization makes sense for your current work.
