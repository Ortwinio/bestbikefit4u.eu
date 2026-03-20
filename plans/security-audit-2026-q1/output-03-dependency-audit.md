# Output 03 — Dependency Audit

Date: `2026-03-18`
Plan: `plans/security-audit-2026-q1`
Step: `03-dependency-audit.md`

## 1. npm Audit

`npm audit` could not be executed in the current sandboxed environment (DNS/network restriction blocks registry.npmjs.org). This is the same limitation noted in the original audit (output-02-automated-security-baseline.md finding B-02-01).

**Action required:** Run `npm audit --audit-level=high` in a network-enabled environment (CI or developer shell) and remediate any high/critical findings before the next release.

---

## 2. New Dependencies Since Baseline (`e79b451`)

The following packages appear in `package.json` that were not present in the original audit baseline, based on the diff of functionality added:

| Package | Version | Purpose | Assessment |
|---|---|---|---|
| `@base-ui/react` | `^1.3.0` | Headless UI primitives (Prototyper UI migration) | Published by the MUI team; widely used; no known supply-chain concerns. Replaces custom primitive implementations. |
| `@hookform/resolvers` | `^5.2.2` | Zod/Yup resolver bridge for react-hook-form | Standard companion package from the react-hook-form org; low risk. |
| `react-hook-form` | `^7.71.1` | Form state management | Major well-maintained library; low risk. |
| `zod` | `^4.3.6` | Schema validation for forms | Major well-maintained library; low risk. |

**Note:** The tire pressure and dashboard features do not introduce backend-side dependencies — all new Convex modules use only existing `convex/values` validators. The `pressureCalculations` logic is pure TypeScript with no new external imports.

Packages already present at baseline audit (unchanged):
- `next`, `react`, `react-dom`, `convex`, `@convex-dev/auth`, `@auth/core`, `resend`, `@sentry/nextjs`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `playwright`.

---

## 3. Prototyper UI Components — Runtime Dependencies

The Prototyper UI migration copied source files into `src/components/ui/`. Checking imports across the migrated components:

- `Button.tsx`: imports from `class-variance-authority`, `lucide-react` — both in `package.json`.
- `Card.tsx`, `Input.tsx`, `Select.tsx`, `FieldLabel.tsx`, `States.tsx`: import from `clsx`/`tailwind-merge` via `@/utils/cn` — in `package.json`.
- `AccessibleDialog.tsx`, `Tooltip.tsx`: import from `@base-ui/react` — newly added to `package.json`.
- `Progress.tsx`: import from `@base-ui/react` — newly added.

**All runtime dependencies referenced by Prototyper UI components are present in `package.json`.** No external CDN or font loads are introduced by these components. `globals.css` uses `@import "tailwindcss"` (build-time PostCSS, not an external URL) and defines fonts from system font stacks only — no external `@font-face` with remote URLs.

---

## 4. Supply-Chain Assessment

| Package | postinstall script? | Single-maintainer risk? | Notes |
|---|---|---|---|
| `@base-ui/react` | No | No (MUI team) | Safe |
| `@hookform/resolvers` | No | No (react-hook-form org) | Safe |
| `react-hook-form` | No | No (large community) | Safe |
| `zod` | No | Low (Colin McDonnell, widely sponsored) | Safe |

No new packages with `postinstall` scripts observed. All new packages are from established, high-download organizations or maintainers.

---

## 5. Recommendations

| Priority | Action |
|---|---|
| P1 | Run `npm audit --audit-level=high` in CI before every release. Remediate any high/critical findings. |
| P2 | Pin major versions (not `^`) for security-sensitive packages (`@sentry/nextjs`, `convex`, `@convex-dev/auth`) to prevent unexpected major upgrades. |
| P3 | Add `npm audit` as a required CI gate (was listed as P2 in original audit — still not implemented). |
