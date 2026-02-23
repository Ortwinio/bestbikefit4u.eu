# Step 01 - Security Inventory and Threat Model

## Objective
Create a clear inventory of assets, trust boundaries, and realistic threat scenarios for this stack.

## Inputs
- `src/` and `convex/` architecture
- `src/proxy.ts`, auth flows, dashboard flows
- Deployment model (Vercel + Convex + third-party services)
- Existing headers and cookie/session behavior

## Tasks
1. Build asset inventory:
   - Public pages, authenticated pages, API endpoints, Convex functions, external integrations.
2. Classify data:
   - Account identifiers, fit-session data, reports, operational logs.
3. Map trust boundaries:
   - Browser ↔ Next.js ↔ Convex ↔ third-party services.
4. Document authentication and authorization flow:
   - Login, session checks, protected route gating, backend permission checks.
5. Create threat model (STRIDE-style):
   - Spoofing, tampering, repudiation, data disclosure, DoS, privilege escalation.
6. Produce initial risk register with severity (`P0-P3`).

## Deliverable
- `plans/security-website-security-audit-hardening/output-01-security-inventory-and-threat-model.md`

## Completion Checklist
- [ ] Asset inventory is complete and scoped.
- [ ] Data classification is documented.
- [ ] Threat model includes top attack paths and likely abuse cases.
- [ ] Risk register includes severity and candidate owner per finding.

