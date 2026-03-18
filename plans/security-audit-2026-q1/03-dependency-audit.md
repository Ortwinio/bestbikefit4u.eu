# Step 03 — Dependency Audit

## Objective

Identify new dependencies added since the original audit and check for known vulnerabilities.

## Tasks

1. Run `npm audit --json 2>&1` and capture output
   - Flag any `high` or `critical` severity findings
   - Note if advisory endpoint is blocked (as in the original audit)

2. Check `package.json` for new dependencies since last audit:
   - Compare current deps against what was present in `e79b451`
   - For each new package: what does it do? Is it from a reputable publisher? Is it pinned to a specific version?

3. Check Prototyper UI components — they are copied source files, not installed packages:
   - Do the copied components import any external runtime dependencies?
   - Are those dependencies already in `package.json`?

4. Check for packages with known issues:
   - Any packages using `postinstall` scripts? (supply-chain risk)
   - Any packages with very low download counts or single-maintainer risk?

## Output

Document in `output-03-dependency-audit.md`:
- `npm audit` summary (severity counts)
- New packages since last audit with brief assessment
- Any supply-chain concerns
- Recommended actions (update, remove, accept risk)
