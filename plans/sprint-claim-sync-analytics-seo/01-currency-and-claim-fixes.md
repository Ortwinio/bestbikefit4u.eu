# T01 + T02 — Currency fix and unbuilt feature gating

**Tickets:** T01 (EUR), T02 (Coming soon badges)
**Effort:** ~3 hours
**Deploys independently:** Yes — deploy as soon as tests pass

---

## Context

The pricing page currently shows `$0`, `$9`, `$29`. The domain is `bestbikefit4u.eu` and the target market is EU. USD prices create legal ambiguity under EU consumer protection rules and immediately signal "not built for me" to a European visitor.

Separately, six features listed on the pricing page do not exist in the product:

| Feature | Tier | Status |
|---------|------|--------|
| Export to PDF | Pro | Not built — dashboard button is disabled |
| Branded PDF reports | Premium | Not built |
| API access | Premium | Not built |
| Client management dashboard | Premium | Not built |
| Team collaboration | Premium | Not built |
| Custom integrations | Premium | Not built |

A paying user who finds a disabled button where a listed feature should be is a refund and a negative review.

---

## Files to change

- `src/app/(public)/pricing/page.tsx`
- `src/i18n/messages/en.ts` (any price string or currency reference)
- `src/i18n/messages/nl.ts` (same)
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` — PDF button state must match pricing page

---

## T01 — Currency changes

### Rule
Replace every `$` currency denomination with `€` in all public-facing content.

### Changes in `pricing/page.tsx`

```
$0  → €0
$9  → €9
$29 → €29
```

Verify the comparison table, FAQ section, and the "14-day money-back guarantee" section all use `€`.

### Changes in i18n files

Search both `en.ts` and `nl.ts` for any string containing `$` followed by a digit. Replace with `€`.

### Verification command

```bash
grep -rn '\$[0-9]' src/app/\(public\)/ src/i18n/
# Must return zero results after fix
```

---

## T02 — Unbuilt feature gating

### Design pattern

Add a `ComingSoonBadge` inline component:

```tsx
// src/components/ui/ComingSoonBadge.tsx
export function ComingSoonBadge() {
  return (
    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Coming soon
    </span>
  );
}
```

Apply it inline next to the feature label in the feature list and the comparison table:

```tsx
<li>Export to PDF <ComingSoonBadge /></li>
```

### Features to badge

Apply `<ComingSoonBadge />` to the following feature entries in both the feature list and the comparison table:

| Feature string (EN) | Tier |
|--------------------|------|
| "Export to PDF" | Pro |
| "Branded PDF reports" | Premium |
| "API access" | Premium |
| "Client management dashboard" | Premium |
| "Team collaboration" | Premium |
| "Custom integrations" | Premium |

Apply equivalent badges to the NL translations:

| Feature string (NL) | Tier |
|--------------------|------|
| "Export naar PDF" | Pro |
| "Branded PDF-rapporten" | Premium |
| "API-toegang" | Premium |
| "Klantenbeheer dashboard" | Premium |
| "Teamsamenwerking" | Premium |
| "Aangepaste integraties" | Premium |

### Tier description rewrites

**Pro tier description (EN):**
> For dedicated cyclists who want to track progress across multiple bikes and get deeper fit analysis. PDF export is on the way.

**Pro tier description (NL):**
> Voor serieuze fietsers die meerdere fietsen bijhouden en diepgaandere fit-analyses willen. PDF-export is in ontwikkeling.

**Premium tier description (EN):**
> For coaches, fitters, and shops managing clients. Client portal, branded reports, and API access are in active development — early adopters get priority access.

**Premium tier description (NL):**
> Voor coaches, fitters en fietsenwinkels die klanten begeleiden. Clientportaal, branded rapporten en API-toegang zijn in ontwikkeling — vroege gebruikers krijgen prioritaire toegang.

### Support label rewrites

| Current | Rewrite (EN) |
|---------|-------------|
| "Priority email support" | "Email support" |
| "Dedicated support and training" | "Dedicated onboarding support" |

### FAQ sync

The FAQ page has this answer:
> "PDF export is being rolled out. You can already email your results and review previous sessions from your dashboard."

This is already honest. No change needed. Verify it still matches after pricing page update.

### Dashboard PDF button

In `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`, find the PDF export button. It must show a "Coming soon" state consistent with the pricing page. Acceptable patterns:

```tsx
<Button disabled>
  Export to PDF <ComingSoonBadge />
</Button>
```

Or if it already shows a disabled state, add the badge label to the button text.

---

## Acceptance criteria

- [ ] `/pricing` in EN: no `$`, no unbuilt feature without badge — visual check
- [ ] `/pricing` in NL: same — visual check
- [ ] `grep -rn '\$[0-9]' src/app/\(public\)/ src/i18n/` returns zero results
- [ ] Dashboard PDF button shows "coming soon" state — log in as Pro, go to results page
- [ ] Pro tier description is accurate (no false promise on PDF)
- [ ] Premium tier description is accurate
- [ ] FAQ answer is consistent with pricing page

## Edge cases

- If pricing data is stored in a config array, change the config rather than multiple literal strings
- The comparison table has a `["PDF export", "No", "Yes", "Branded"]` row — the "Yes" and "Branded" cells need badges, not the "No" cell

## Human audit checklist

- [ ] Open `/pricing` on mobile — confirm badges do not break the line wrapping on narrow screens
- [ ] Log in as Free user — upgrade prompt copy must match new EUR prices
- [ ] Log in as Pro user — find PDF button in results — confirm "coming soon" state
