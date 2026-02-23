# Step 02 - Automated Security Baseline

## Objective
Run automated checks to establish a measurable baseline for code and dependency risk.

## Inputs
- `package.json`, lockfile, CI scripts
- Next.js + TypeScript source
- Convex functions and schema files
- Existing lint/test/build pipeline

## Tasks
1. Dependency audit:
   - Run `npm audit` and classify vulnerabilities by exploitability and runtime exposure.
2. Secret leakage scan:
   - Scan repository history and working tree for exposed keys/tokens.
3. Static security linting:
   - Detect risky patterns (`dangerouslySetInnerHTML`, weak crypto usage, eval-like behavior).
4. Header/security config scan:
   - Verify CSP, HSTS policy strategy, frame protections, MIME sniffing protections, referrer policy.
5. Auth route checks:
   - Detect unguarded protected paths and unsafe redirects.
6. Produce findings with reproducible command list and severity mapping.

## Deliverable
- `plans/security-website-security-audit-hardening/output-02-automated-security-baseline.md`

## Completion Checklist
- [ ] Automated scan commands are documented and repeatable.
- [ ] Findings include affected files, severity, and remediation hints.
- [ ] False positives are explicitly marked.
- [ ] Baseline can be rerun in CI without manual steps.

