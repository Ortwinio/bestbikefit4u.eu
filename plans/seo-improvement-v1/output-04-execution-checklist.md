# Output 04 — Execution Checklist

**Plan:** `plans/seo-improvement-v1/README.md`  
**Purpose:** convert the SEO improvement plan into an execution-ready checklist grouped by implementation slice, write scope, dependencies, and done criteria

---

## 1. Recommended Execution Order

Execute in this order:

1. landing pages
2. sitemap and metadata wiring
3. core internal-link cluster
4. science and guide cross-links
5. CMS keyword-source decision and validation

This order keeps routing and metadata stable before broader link edits.

---

## 2. Work Packages

### WP-01 — New Landing Pages

**Goal**

Ship the three missing intent landing pages:

- `/nl/fiets-afstellen`
- `/nl/bikefitting`
- `/en/bike-fitting`

**Files**

- `src/app/(public)/fiets-afstellen/page.tsx`
- `src/app/(public)/bikefitting/page.tsx`
- `src/app/(public)/bike-fitting/page.tsx`

**Dependencies**

- existing public page primitives
- locale/alternate conventions already used in `src/app/(public)`

**Tasks**

- [ ] Create the three route files.
- [ ] Add complete metadata:
  - title
  - description
  - keywords
  - canonical
  - alternates
- [ ] Add at least one above-the-fold link to the most relevant calculator.
- [ ] Add at least one guide or science support link per page.
- [ ] Keep `/nl/fiets-afstellen` and `/nl/bikefitting` distinct in intent and copy.

**Done criteria**

- [ ] All three routes render correctly.
- [ ] All three pages are indexable and internally linked.
- [ ] Each page has a clear calculator handoff.

---

### WP-02 — Sitemap And Guide Metadata

**Goal**

Ensure the new landing pages and guide keyword metadata are technically discoverable.

**Files**

- `src/lib/seo/sitemap/sources.ts`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/guides/data.ts`

**Dependencies**

- WP-01 completed

**Tasks**

- [ ] Add new landing pages to sitemap sources.
- [ ] Expose `keywords` metadata for guide pages from fallback guide SEO data.
- [ ] Document source-of-truth behavior for guide keywords.

**Done criteria**

- [ ] New landing pages appear in sitemap sources.
- [ ] Guide route metadata includes keywords.
- [ ] No duplicate schema work is introduced.

---

### WP-03 — Core Internal-Link Cluster

**Goal**

Strengthen the highest-value public cluster around:

- `bikefitting`
- `bike fitting`
- `fiets afstellen`
- `zadelhoogte afstellen`

**Files**

- `src/app/(public)/page.tsx`
- `src/app/(public)/guides/page.tsx`
- `src/app/(public)/pain/page.tsx`
- `src/app/(public)/use-cases/page.tsx`
- `src/app/(public)/how-it-works/page.tsx`
- `src/app/(public)/measurement-guide/page.tsx`
- `src/app/(public)/why-bikefit-matters/page.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`

**Dependencies**

- WP-01
- WP-02

**Tasks**

- [ ] Apply the route-level matrix from `output-03-page-by-page-implementation-matrix.md`.
- [ ] Link homepage directly into:
  - bike-fit calculator
  - saddle-height calculator
  - guides hub
  - pain hub
  - stack-and-reach page
  - measurement guide
- [ ] Reinforce `/calculators/bike-fit` with contextual links from hubs/support pages.
- [ ] Reinforce `/calculators/saddle-height` from pain and measurement pages.
- [ ] Reinforce `/science/stack-and-reach` ↔ `/calculators/frame-size` ↔ `/guides/road-bike-fit-guide`.
- [ ] Keep anchors descriptive and localized.

**Done criteria**

- [ ] Homepage links into the core cluster.
- [ ] `/calculators/bike-fit` receives contextual links from multiple public donor pages.
- [ ] `/calculators/saddle-height` receives contextual links from symptom/support pages.
- [ ] The `reach racefiets` cluster is bidirectional.

---

### WP-04 — Guide And Use-Case Cross-Links

**Goal**

Tighten the supporting content network so existing guides and use cases reinforce the calculator funnel.

**Files**

- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/guides/data.ts`
- `src/app/(public)/use-cases/[slug]/page.tsx`
- `src/app/(public)/use-cases/data.ts`
- `src/app/(public)/science/bike-fit-methods/page.tsx`
- `src/app/(public)/science/calculation-engine/page.tsx`
- `src/app/(public)/science/stack-and-reach/page.tsx`

**Dependencies**

- WP-03

**Tasks**

- [ ] Refine `relatedLinks` for all existing guide slugs in current data.
- [ ] Refine `relatedLinks` for all existing use-case slugs.
- [ ] Ensure science pages link down into calculators and guides.
- [ ] Improve calculator-related anchors on the highest-value guides:
  - knee pain
  - lower back pain
  - road bike fit

**Done criteria**

- [ ] Each existing guide has 3-5 route-relevant internal links.
- [ ] Each existing use-case page points intentionally into calculators/guides.
- [ ] Science pages no longer act as dead ends.

---

### WP-05 — Validation And CMS Hardening Decision

**Goal**

Validate the shipped slice and decide whether guide keyword management remains fallback-first or moves into CMS.

**Files**

- `plans/seo-improvement-v1/04-cms-hardening-and-validation.md`
- optional:
  - `convex/schema.ts`
  - guide CMS queries/mutations if keyword-schema extension is chosen

**Dependencies**

- WP-01 through WP-04

**Tasks**

- [x] Decide and document the long-term keyword source of truth.
- [ ] Only extend CMS keyword support if truly needed for the release.
- [x] Run technical validation:
  - `npm run typecheck`
  - targeted route/metadata checks if present
  - sitemap validation if touched
- [x] Record what shipped, what was deferred, and what must be monitored post-launch.

**Done criteria**

- [x] Keyword source-of-truth decision is explicit.
- [x] Technical validation is complete.
- [x] Deferred work is clearly documented.

**Current release note**

- The release ships with a fallback-first guide keyword model.
- `npm run build` passed for the implementation slice.
- `npm run typecheck` passed after fresh `.next` types were generated by the build.

---

## 3. File Ownership / Write Scope Suggestion

### Content and public page implementation

- `src/app/(public)/**/*`
- `src/app/(public)/guides/data.ts`
- `src/app/(public)/use-cases/data.ts`

### SEO plumbing

- `src/lib/seo/**/*`
- `src/app/sitemap*.xml/route.ts` if sitemap routing needs touching

### CMS / schema hardening

- `convex/schema.ts`
- `convex/guides/**/*`

### Plan and validation artifacts

- `plans/seo-improvement-v1/**/*`

---

## 4. Sprint Cut Recommendation

### Sprint A — shippable SEO foundation

- WP-01
- WP-02

### Sprint B — internal-linking lift

- WP-03
- WP-04

### Sprint C — validation and hardening

- WP-05

This keeps the first release small enough to validate before deeper CMS changes.

---

## 5. Global Success Criteria

- [ ] New landing pages exist, are indexable, and link into calculators.
- [ ] Guide metadata exposes keywords from a defined source of truth.
- [ ] Homepage, core calculators, guides, pain hub, and science pages form a coherent internal-link graph.
- [ ] Dutch anchor text supports Dutch intent clusters.
- [ ] English anchor text supports English intent clusters.
- [ ] No primary contextual links use generic anchors like `read more` or `learn more`.
- [ ] `npm run typecheck` passes after the implementation slice.

---

## 6. Post-Launch Monitoring Checklist

- [ ] Confirm landing pages appear in sitemap output.
- [ ] Confirm metadata renders as expected on new landing pages and guide pages.
- [ ] Check whether `/calculators/bike-fit` gains more internal-link donors.
- [ ] Monitor clicks from landing pages into calculators.
- [ ] Monitor organic entry growth for:
  - `/nl/fiets-afstellen`
  - `/nl/bikefitting`
  - `/en/bike-fitting`
