# Output 03 — Page-By-Page Implementation Matrix

**Plan:** `plans/seo-improvement-v1/README.md`  
**Purpose:** convert the SEO strategy into an implementation-ready route matrix for the current public site

---

## 1. Objective

Strengthen internal linking and landing-page architecture around these ranking clusters:

- `bikefitting`
- `bike fitting`
- `fiets afstellen`
- `zadelhoogte afstellen`
- `reach racefiets`
- `stuur afstellen racefiets`
- `schoenplaatjes afstellen`

This matrix uses the current repo routes under `src/app/(public)` and the existing guide and use-case datasets.

---

## 2. Route-Level Matrix

### Core hubs and support pages

| Route | File | Role | Add these exact links |
|---|---|---|---|
| `/` | `src/app/(public)/page.tsx` | primary SEO hub | `/calculators/bike-fit`, `/calculators/saddle-height`, `/guides`, `/pain`, `/science/stack-and-reach`, `/measurement-guide` |
| `/guides` | `src/app/(public)/guides/page.tsx` | guide hub | `/guides/road-bike-fit-guide`, `/guides/bike-fitting-for-knee-pain`, `/guides/bike-fitting-for-lower-back-pain`, `/calculators/bike-fit`, `/calculators/saddle-height` |
| `/pain` | `src/app/(public)/pain/page.tsx` | symptom hub | `/guides/bike-fitting-for-knee-pain`, `/guides/bike-fitting-for-lower-back-pain`, `/calculators/saddle-height`, `/calculators/bike-fit` |
| `/use-cases` | `src/app/(public)/use-cases/page.tsx` | scenario hub | `/use-cases/endurance-cycling-fit`, `/use-cases/gravel-cycling-fit`, `/use-cases/mountain-cycling-fit`, `/use-cases/triathlon-bike-fit`, `/calculators/bike-fit` |
| `/how-it-works` | `src/app/(public)/how-it-works/page.tsx` | trust/support | `/calculators/bike-fit`, `/measurement-guide`, `/science/calculation-engine` |
| `/measurement-guide` | `src/app/(public)/measurement-guide/page.tsx` | measurement support | `/calculators/bike-fit`, `/calculators/saddle-height`, `/science/calculation-engine` |
| `/why-bikefit-matters` | `src/app/(public)/why-bikefit-matters/page.tsx` | commercial explainer | `/calculators/bike-fit`, `/guides/road-bike-fit-guide`, `/science/bike-fit-methods` |
| `/faq` | `src/app/(public)/faq/page.tsx` | support distribution | `/calculators/bike-fit`, `/calculators/saddle-height`, `/guides/bike-fitting-for-knee-pain`, `/guides/road-bike-fit-guide` |

### Science pages

| Route | File | Keyword support | Add these exact links |
|---|---|---|---|
| `/science/bike-fit-methods` | `src/app/(public)/science/bike-fit-methods/page.tsx` | bike fitting trust | `/calculators/bike-fit`, `/guides/road-bike-fit-guide`, `/guides/bike-fitting-for-knee-pain` |
| `/science/calculation-engine` | `src/app/(public)/science/calculation-engine/page.tsx` | method transparency | `/calculators/bike-fit`, `/calculators/saddle-height`, `/measurement-guide` |
| `/science/stack-and-reach` | `src/app/(public)/science/stack-and-reach/page.tsx` | `reach racefiets` | `/calculators/frame-size`, `/guides/road-bike-fit-guide`, `/calculators/bike-fit` |

### Calculators

| Route | File | Cluster | Add these exact links |
|---|---|---|---|
| `/calculators/bike-fit` | `src/app/(public)/calculators/bike-fit/page.tsx` | `bike fitting`, `fiets afstellen` | `/measurement-guide`, `/science/bike-fit-methods`, `/science/calculation-engine`, `/guides/road-bike-fit-guide`, `/guides/bike-fitting-for-knee-pain`, `/pain` |
| `/calculators/saddle-height` | `src/app/(public)/calculators/saddle-height/page.tsx` | `zadelhoogte afstellen` | `/measurement-guide`, `/guides/bike-fitting-for-knee-pain`, `/guides/bike-fitting-for-lower-back-pain`, `/calculators/bike-fit` |
| `/calculators/frame-size` | `src/app/(public)/calculators/frame-size/page.tsx` | `reach racefiets` support | `/science/stack-and-reach`, `/guides/road-bike-fit-guide`, `/calculators/bike-fit`, `/why-bikefit-matters` |
| `/calculators/saddle-width` | `src/app/(public)/calculators/saddle-width/page.tsx` | comfort support | `/calculators/bike-fit`, `/guides/bike-fitting-for-knee-pain`, `/guides/gravel-bike-fit-guide` |
| `/calculators/crank-length` | `src/app/(public)/calculators/crank-length/page.tsx` | fit-support secondary | `/calculators/bike-fit`, `/guides/mountain-bike-fit-guide`, `/guides/triathlon-bike-fit-guide` |
| `/calculators/gearing` | `src/app/(public)/calculators/gearing/page.tsx` | secondary | `/guides/road-bike-fit-guide`, `/use-cases/endurance-cycling-fit` |
| `/calculators/power-speed` | `src/app/(public)/calculators/power-speed/page.tsx` | secondary | `/guides/road-bike-fit-guide`, `/use-cases/endurance-cycling-fit` |
| `/calculators/ftp-wkg` | `src/app/(public)/calculators/ftp-wkg/page.tsx` | secondary | `/use-cases/endurance-cycling-fit`, `/guides/road-bike-fit-guide` |
| `/calculators/fuel-hydration` | `src/app/(public)/calculators/fuel-hydration/page.tsx` | secondary | `/use-cases/endurance-cycling-fit` |
| `/calculators/climb-planner` | `src/app/(public)/calculators/climb-planner/page.tsx` | secondary | `/use-cases/endurance-cycling-fit`, `/guides/road-bike-fit-guide` |

### Guides

Guide detail routes share one renderer:

- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/guides/data.ts`

Per guide slug, refine `relatedLinks` and supporting copy:

| Guide slug | Cluster | Add/keep these exact links |
|---|---|---|
| `bike-fitting-for-knee-pain` | pain + saddle setup | `/calculators/saddle-height`, `/calculators/bike-fit`, `/guides/bike-fitting-for-lower-back-pain`, `/measurement-guide` |
| `bike-fitting-for-lower-back-pain` | cockpit + reach | `/science/stack-and-reach`, `/calculators/bike-fit`, `/guides/road-bike-fit-guide`, `/calculators/frame-size` |
| `road-bike-fit-guide` | road fit / cockpit | `/calculators/bike-fit`, `/calculators/frame-size`, `/science/stack-and-reach`, `/calculators/saddle-height`, `/guides/bike-fitting-for-lower-back-pain` |
| `gravel-bike-fit-guide` | discipline | `/calculators/bike-fit`, `/calculators/saddle-height`, `/use-cases/gravel-cycling-fit`, `/guides/road-bike-fit-guide` |
| `mountain-bike-fit-guide` | discipline | `/calculators/bike-fit`, `/calculators/crank-length`, `/use-cases/mountain-cycling-fit` |
| `triathlon-bike-fit-guide` | discipline | `/calculators/bike-fit`, `/science/stack-and-reach`, `/use-cases/triathlon-bike-fit` |

### Use cases

Use-case detail routes share one renderer:

- `src/app/(public)/use-cases/[slug]/page.tsx`
- `src/app/(public)/use-cases/data.ts`

Per use-case slug, refine `relatedLinks`:

| Use-case slug | Add/keep these exact links |
|---|---|
| `endurance-cycling-fit` | `/calculators/bike-fit`, `/calculators/saddle-height`, `/guides/road-bike-fit-guide` |
| `gravel-cycling-fit` | `/calculators/bike-fit`, `/guides/gravel-bike-fit-guide`, `/guides/road-bike-fit-guide` |
| `mountain-cycling-fit` | `/calculators/bike-fit`, `/calculators/crank-length`, `/guides/mountain-bike-fit-guide` |
| `triathlon-bike-fit` | `/calculators/bike-fit`, `/guides/triathlon-bike-fit-guide`, `/science/stack-and-reach` |
| `commuter-bike-fit` | `/calculators/bike-fit`, `/guides/road-bike-fit-guide`, `/calculators/saddle-height` |
| `back-pain-cycling` | `/guides/bike-fitting-for-lower-back-pain`, `/calculators/bike-fit`, `/science/stack-and-reach` |
| `short-torso-bike-fit` | `/calculators/frame-size`, `/science/stack-and-reach`, `/guides/road-bike-fit-guide` |
| `tall-rider-bike-fit` | `/calculators/frame-size`, `/science/stack-and-reach`, `/calculators/bike-fit` |

---

## 3. Anchor-Text Families

### Dutch

- `fiets afstellen`
- `fiets afstellen stap voor stap`
- `bikefit berekenen`
- `zadelhoogte afstellen`
- `reach racefiets`
- `reach en stuurpen bepalen`
- `stuur afstellen racefiets`
- `racefiets fit gids`
- `bikefitting bij kniepijn`
- `bikefitting bij lage rugklachten`
- `stack en reach`

### English

- `bike fitting`
- `bike fitting calculator`
- `bike fit step by step`
- `set saddle height`
- `road bike reach`
- `determine reach and stem length`
- `adjust road bike handlebars`
- `road bike fit guide`
- `bike fitting for knee pain`
- `bike fitting for lower back pain`
- `stack and reach guide`

### Anchor rules

- Use one exact-match anchor for the primary keyword target on a page.
- Use partial-match or semantic variants for supporting links.
- Avoid generic anchors such as:
  - `read more`
  - `learn more`
  - `open guide`
  - `bekijk hier`

---

## 4. Success Criteria

### Internal-linking execution success

- Homepage links directly to the core calculator + guide + science cluster.
- `/calculators/bike-fit` receives contextual links from:
  - homepage
  - at least one science page
  - at least two guide/use-case pages
- `/calculators/saddle-height` receives contextual links from:
  - homepage or guides hub
  - measurement guide
  - knee-pain guide
  - lower-back-pain guide
- `/science/stack-and-reach`, `/calculators/frame-size`, and `/guides/road-bike-fit-guide` form a bidirectional `reach racefiets` cluster.
- `/pain` routes symptom traffic into calculators rather than acting only as a lateral content hub.

### Content-quality success

- Primary internal links are descriptive and query-matched.
- Dutch pages use Dutch anchor language.
- English pages use English anchor language.
- Links remain editorially natural and do not read like SEO stuffing.

### Technical success

- New landing pages are included in the sitemap.
- Guide metadata exposes `keywords` from a defined source of truth.
- No implementation task duplicates already-complete breadcrumb or FAQ schema work.

---

## 5. Acceptance Criteria

- [ ] New landing pages exist and are indexable:
  - `/nl/fiets-afstellen`
  - `/nl/bikefitting`
  - `/en/bike-fitting`
- [ ] Homepage links directly to:
  - `/calculators/bike-fit`
  - `/calculators/saddle-height`
  - `/guides`
  - `/pain`
  - `/science/stack-and-reach`
  - `/measurement-guide`
- [ ] Core calculator pages include route-relevant guide and science links.
- [ ] Existing guide pages expose stronger, topic-matched calculator links.
- [ ] Existing use-case pages link intentionally into calculator and guide routes.
- [ ] Science pages link down into calculator and guide pages instead of acting as dead ends.
- [ ] Primary contextual links avoid generic anchor text.
- [ ] `npm run typecheck` passes after implementation.

---

## 6. Future Gap Note

The current public route structure still lacks a strong public `schoenplaatjes afstellen` pillar.

Recommended future addition:

- `/guides/cleat-position-guide`

When that page is added, connect it to:

- `/guides/bike-fitting-for-knee-pain`
- `/pain`
- `/calculators/bike-fit`
- `/shoe-cleat-fit` as a secondary conversion path
