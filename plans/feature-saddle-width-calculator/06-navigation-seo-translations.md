# Prompt 06 — Navigation, Footer, SEO, and Translations

## Context

Project: BestBikeFit4U — Next.js 16 (App Router), TypeScript.

You are completing the saddle width calculator feature by wiring up navigation, footer links, i18n strings, and SEO entries. Prompts 04 and 05 must be complete before this one.

This prompt has no complex logic — it is wiring and content work. Read each file before editing.

---

## Part A — Footer

File: `src/components/layout/Footer.tsx`

The footer Calculators column already lists: Bike Fit, Saddle Height, Frame Size, Crank Length, Tire Pressure.

Add **Saddle Width Calculator** after Saddle Height and before Frame Size:

```tsx
<li>
  <Link
    href={withLocalePrefix("/calculators/saddle-width", locale)}
    className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
  >
    {f.saddleWidth}
  </Link>
</li>
```

---

## Part B — i18n footer labels

File: `src/i18n/messages/en.ts`

Add to `nav.footer`:
```typescript
saddleWidth: "Saddle Width Calculator",
```

File: `src/i18n/messages/nl.ts`

Add to `nav.footer`:
```typescript
saddleWidth: "Zadelbreedtecalculator",
```

---

## Part C — Homepage "Popular Calculators" section

File: `src/app/(public)/page.tsx`

The homepage has a "Popular Calculators" grid card section. Find it and add the Saddle Width Calculator card:

```tsx
{
  href: withLocalePrefix("/calculators/saddle-width", locale),
  title: isNl ? "Zadelbreedtecalculator" : "Saddle Width Calculator",
  description: isNl
    ? "Bereken je ideale zadelbreedteaanbeveling op basis van zitbeenmeting of lichaamsgegevens."
    : "Calculate your ideal saddle width from sit-bone measurement or body data.",
  icon: <ArrowUpDown className="h-5 w-5" />,
}
```

Import `ArrowUpDown` from `lucide-react` at the top of the file if not already imported.

---

## Part D — SEO: sitemap

File: locate the file that populates `sitemap-calculators.xml` (check `src/lib/seo/sitemap/sources.ts` or `src/app/sitemap-calculators.xml/route.ts`).

Add `/calculators/saddle-width` to the list of calculator pages with:
- `changeFrequency: "monthly"`
- `priority: 0.8`

---

## Part E — SEO: related links

File: `src/lib/seo/relatedLinks.ts`

Add a `"saddle-width"` key to the `getRelatedLinks` function returning:

EN:
```typescript
[
  { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
  { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
  { href: "/calculators/frame-size", label: "Frame Size Calculator" },
  { href: "/faq", label: "FAQ" },
  { href: "/measurement-guide", label: "Measurement Guide" },
]
```

NL:
```typescript
[
  { href: "/calculators/bike-fit", label: "Bike fit calculator" },
  { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
  { href: "/calculators/frame-size", label: "Framemaat calculator" },
  { href: "/faq", label: "FAQ" },
  { href: "/measurement-guide", label: "Meetgids" },
]
```

Also add `"saddle-width"` as a related link in the `"saddle-height"` and `"bike-fit"` entries, since saddle width is a natural next step after saddle height.

---

## Part F — SEO: public nav or header

File: `src/components/layout/Header.tsx`

Check whether the header has a "Tools" or "Calculators" dropdown that lists individual calculators. If so, add "Saddle Width Calculator" → `/calculators/saddle-width`.

If the header uses i18n labels, add the label to `nav.tools` section in both `en.ts` and `nl.ts`.

---

## Part G — Validation

After completing this prompt:
1. `npx tsc --noEmit` must pass
2. Footer Calculators column shows Saddle Width Calculator between Saddle Height and Frame Size
3. Homepage calculator grid includes the saddle width card
4. `sitemap-calculators.xml` includes `/calculators/saddle-width`
5. `getRelatedLinks("saddle-width", "en")` returns 5 links
6. `getRelatedLinks("saddle-height", "en")` includes saddle-width as a related link
