# Gate E Validation

Date: 2026-04-08

## Scope

This validation covers the website-facing closeout criteria for:

- public pages in `src/app/(public)`
- auth start page in `src/app/(auth)`
- shared website surfaces in `src/components/public`
- website layout and feedback surfaces in `src/components/layout`, `src/components/auth`, and `src/components/feedback`

Dashboard-only surfaces remain out of scope for this gate.

## Validation Criteria

### 1. Prototyper UI only on website surfaces

Validation command:

```bash
rg -n "@/components/ui|InfoBox|SliderQuestion|variant=\"bordered\"" src/components/feedback src/components/public 'src/app/(public)' 'src/app/(auth)'
```

Result:

- no matches

Notes:

- Website-facing pages and touched shared surfaces no longer import the legacy `@/components/ui` barrel.
- Remaining legacy UI usage found during layout review is in `src/components/layout/DashboardSidebar.tsx`, which is a dashboard surface and outside the website gate.

### 2. Header / mobile menu / cookie / authenticated header consistency

Validated surfaces:

- `src/components/layout/HeaderMobileMenu.tsx`
- `src/components/layout/HeaderAuthActions.tsx`
- `src/components/layout/CookieConsentBanner.tsx`
- `src/components/auth/UserMenu.tsx`
- `src/app/layout.tsx`

Result:

- all validated website layout surfaces use Prototyper-facing button/dialog/toast paths
- no legacy website UI imports remain on those surfaces

### 3. Light / dark / system theme behavior

Validation command:

```bash
npx vitest run 'src/components/providers/ThemeProvider.test.tsx'
```

Result:

- passed

Covered checks:

- stored dark preference applies `.dark`
- system theme follows `matchMedia`
- authenticated theme changes persist locally and through profile update flow

### 4. Website regression suite

Validation command:

```bash
npx vitest run \
  'src/components/feedback/FeedbackFloatingButton.test.tsx' \
  'src/components/providers/ThemeProvider.test.tsx' \
  'src/app/(auth)/login/page.test.tsx' \
  'src/app/(public)/pricing/page.test.tsx' \
  'src/app/(public)/page.test.tsx' \
  'src/app/(public)/calculators/crank-length/page.test.tsx' \
  'src/app/(public)/faq/page.test.tsx' \
  'src/app/(public)/contact/page.test.tsx'
```

Result:

- 9 test files passed
- 16 tests passed

### 5. Security review note

Validation command:

```bash
rg -n 'dangerouslySetInnerHTML|target="_blank"|localStorage|document\.cookie|innerHTML' \
  'src/app/(public)' 'src/app/(auth)' 'src/components/public' \
  'src/components/layout' 'src/components/auth' 'src/components/feedback'
```

Result:

- no website/auth matches for `target="_blank"`, `localStorage`, `document.cookie`, or generic `innerHTML`
- `dangerouslySetInnerHTML` appears only in static structured-data injections:
  - `src/app/(public)/faq/page.tsx`
  - `src/app/(public)/science/calculation-engine/page.tsx`
  - `src/app/(public)/science/stack-and-reach/page.tsx`
  - `src/app/(public)/science/bike-fit-methods/page.tsx`

Assessment:

- these uses are acceptable because they inject server-generated JSON-LD via `JSON.stringify(...)`
- they are not fed by user input and do not create an interactive XSS path in the reviewed website flows
- no new client-side secret handling was introduced in the touched website/auth surfaces

## Residual Risks

- Dashboard UI still contains legacy imports outside this gate and should be migrated separately if the Prototyper-only rule is extended beyond the website.
- This gate relies on targeted automated checks and source inspection; it does not replace a full production security audit or browser-based penetration test.
