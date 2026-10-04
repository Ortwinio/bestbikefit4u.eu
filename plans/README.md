# Plans directory

Create one descriptively named folder per project, following [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md). Prefer `feature-`, `bugfix-`, or `refactor-` prefixes.

## Folder convention

```text
plans/feature-example/
├── README.md
├── 01-first-step.md
├── 02-next-step.md
└── output-01-results.md
```

The project README records the goal, background where needed, scope and out-of-scope work, approach, acceptance criteria, current status and owner. Numbered prompts must be self-contained so another agent can execute each task without the original conversation.

Read the project README first and execute prompts in order. Complete each step and update README progress before continuing. Record validation evidence in repository artifacts such as `output-*.md` or `testplan.md`. Post blockers to `messages/`; continue independent work where possible and explain skipped steps in the README.

Standalone operating policies are allowed when they describe repository workflow rather than an execution sequence. The [tmux-ide operating convention](tmux-ide-minimal-operating-convention.md) remains active. Plans and their evidence take precedence over `.tasks` metadata; completion proof must point to actual repository work.

## Retained operational files

- `cleanup/` contains current cleanup decisions, dependency evidence and checks.
- `migratie/` contains live migration runbooks and manual actions.
- `riderprofile-baseline/` retains the workflow and report destination for the planned 18 October 2026 baseline. This records the operational requirement, not verification of an external scheduler.
- Other retained paths hold script/test inputs, referenced brand/email design sources, or output directory markers. Their presence does not imply the original project remains unfinished.

See [the dependency audit](cleanup/C1-dependency-audit.md) and [retained-file decisions](cleanup/C1-kept.md) before changing operational files. Some generated visual inputs were already ignored and absent from this checkout; the audits record these limitations.

## Completing and removing plans

Mark completed work in its README. Remove historical plans only after checking repository references, dynamic paths, script/test inputs, workflows and referenced policies. Keep uncertain dependencies and record why. An output directory may retain a small README instead of old reports; ignored output directories are recreated by their writers. Preserve existing reports another tool reads as inputs.

Run the cleanup regression check from any working directory using an absolute repository path:

```sh
node --test /path/to/repository/plans/cleanup/C1-required-inputs.test.mjs
```
