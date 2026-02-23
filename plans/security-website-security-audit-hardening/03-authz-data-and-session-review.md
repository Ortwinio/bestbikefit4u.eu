# Step 03 - Authorization, Data, and Session Review

## Objective
Verify that access control, session behavior, and sensitive data handling are secure by design.

## Inputs
- `src/proxy.ts`, auth-related components, protected layouts
- Convex auth usage in queries/mutations/actions
- Report generation and data export paths
- Cookie/session configuration and locale/auth redirects

## Tasks
1. Authorization checks:
   - Confirm server-side authorization for each sensitive action (not only client-side guards).
2. Session and cookie security:
   - Validate `secure`, `httpOnly`, `sameSite`, expiration, and session invalidation behavior.
3. IDOR/BOLA review:
   - Test resource access by changing IDs/session references across user contexts.
4. Data minimization and exposure:
   - Verify sensitive fields are not leaked in client payloads, logs, or errors.
5. Input validation and output encoding:
   - Confirm strong validation at API/Convex boundaries and safe rendering of user-provided content.
6. Create remediation list for all auth/data findings with owner + due date.

## Deliverable
- `plans/security-website-security-audit-hardening/output-03-authz-data-and-session-review.md`

## Completion Checklist
- [ ] All protected flows are validated with explicit server-side checks.
- [ ] Session/cookie controls are reviewed and documented.
- [ ] IDOR-style abuse tests completed.
- [ ] Data leakage vectors are identified and prioritized.

