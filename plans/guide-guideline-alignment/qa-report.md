# Guide Guideline Alignment QA Report

Date: 2026-04-13
Task: 047
Goal: 09

## Outcome

Pass.

The guide guideline alignment work now satisfies the closeout gate:

- `npx tsc --noEmit` passes
- guide template tests pass
- guide content integration tests pass
- all five authored guide content clusters apply the required structural sections across every guide entry
- hero intro and guide-specific CTA description coverage is present in the authored content model
- the public guide page renders richer section types (`steps`, `prose`, `table`)
- fallback behavior for non-authored guides remains covered by test

One issue was found during QA:

- The redesigned guide page no longer consumed authored `ctaDescription` values.
- This was fixed in [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L263) and covered in [page.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.test.tsx#L158).

## Verification Run

Executed:

```bash
npx tsc --noEmit
npx vitest run 'src/app/(public)/guides/[slug]/page.test.tsx' 'src/lib/guides/content.test.ts'
```

Results:

- `npx tsc --noEmit`: passed
- `src/app/(public)/guides/[slug]/page.test.tsx`: 3 passed
- `src/lib/guides/content.test.ts`: 6 passed

## Global Structural Verification

The five required structural sections are defined once per cluster and appended to every guide entry through cluster-level mapping functions:

- pain/discomfort: [pain-discomfort.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/pain-discomfort.ts#L4) and [pain-discomfort.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/pain-discomfort.ts#L113)
- ride types: [ride-types.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/ride-types.ts#L4) and [ride-types.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/ride-types.ts#L113)
- setup parameters: [setup-parameters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/setup-parameters.ts#L4) and [setup-parameters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/setup-parameters.ts#L113)
- shoe/foot/geometry: [shoe-foot-geometry.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/shoe-foot-geometry.ts#L4) and [shoe-foot-geometry.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/shoe-foot-geometry.ts#L113)
- remaining clusters: [remaining-clusters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/remaining-clusters.ts#L4) and [remaining-clusters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/remaining-clusters.ts#L113)

This guarantees that every guide entry in those modules receives:

- `How to measure` / `Hoe je het meet`
- `How to adjust` / `Hoe je het afstelt`
- `Warning signs` / `Waarschuwingssignalen`
- `Variations by rider type` / `Verschillen per rijtype`
- `Practical recommendation` / `Praktische aanbeveling`

Type/rendering shape of these shared sections is also consistent:

- `How to measure` and `How to adjust`: `type: "steps"`
- `Variations by rider type`: `type: "table"`
- `Practical recommendation`: `type: "prose"`

Examples:

- [pain-discomfort.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/pain-discomfort.ts#L7)
- [ride-types.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/ride-types.ts#L37)
- [setup-parameters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/setup-parameters.ts#L49)
- [shoe-foot-geometry.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/shoe-foot-geometry.ts#L37)
- [remaining-clusters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/remaining-clusters.ts#L49)

## FAQ / Hero / CTA Coverage

Every authored cluster also applies hero intro, CTA description, and FAQ expansion through cluster-level mapping functions:

- [pain-discomfort.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/pain-discomfort.ts#L183)
- [ride-types.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/ride-types.ts#L183)
- [setup-parameters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/setup-parameters.ts#L183)
- [shoe-foot-geometry.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/shoe-foot-geometry.ts#L183)
- [remaining-clusters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/remaining-clusters.ts#L183)

This guarantees per guide entry:

- `heroIntro`
- `ctaDescription`
- existing FAQ array plus 2 additional guide-specific FAQ items

Representative authored entries with explicit hero/CTA content:

- [pain-discomfort.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/pain-discomfort.ts#L206)
- [pain-discomfort.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/pain-discomfort.ts#L393)
- [pain-discomfort.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/pain-discomfort.ts#L813)

The guide content model supports these fields in:

- [guide-content.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/guide-content.ts#L18)

## Renderer Verification

The leaf-guide renderer supports all required section types:

- `cards`: [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L87)
- `steps`: [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L99)
- `prose`: [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L111)
- `table`: [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L120)

Hero intro is consumed from authored guide content here:

- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L263)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L336)

Guide-specific CTA description is now consumed for the closing CTA here:

- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L272)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx#L495)

## Representative Spot Checks

Three-plus guides per cluster were reviewed through source and/or tests.

### Pain & Discomfort

Sample guides:

- `bike-fitting-for-knee-pain`
- `bike-fitting-for-lower-back-pain`
- `bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores`

Findings:

- clear symptom-specific intros and measurement guidance
- warning signs present with 4 items
- rider-type variations are concrete and discipline-specific
- CTA copy is specific to fit flow or saddle-width workflow

### Ride Types

Sample guides:

- `road-bike-fit-guide`
- `gravel-bike-fit-guide`
- `mountain-bike-fit-guide`

Findings:

- road/gravel/MTB priorities are distinct
- discipline comparison uses table rendering
- practical recommendation is prose, not fragmented cards

### Setup Parameters

Sample guides:

- `saddle-height-guide`
- `reach-and-stem-guide`
- `handlebar-drop-guide`

Findings:

- measure/adjust sections use numbered steps
- rider-type variation is table-based
- setup advice uses concrete step sizes in mm / degrees

### Shoe / Foot / Geometry

Sample guides:

- `foot-measurement-guide-for-cyclists`
- `cleat-position-basics-guide`
- `frame-size-guide`

Findings:

- foot/shoe/geometry guidance is specific and actionable
- fit interactions between shoe, cleat, stance, and geometry are explicit
- prose closing recommendations are present

### Remaining Clusters

Sample guides:

- `cycling-fueling-basics`
- `ftp-explained`
- `bike-fit-for-tall-riders`

Findings:

- structural sections are present for nutrition, power, and fit edge-case guides as well
- `remaining-clusters.ts` contains no bike-fit pain-language bleed such as `knee pain`, `back pain`, `wrist pain`, `hand numbness`, or `saddle sores`
- the comparison table is generalized appropriately for mixed-topic guides

Evidence:

- [remaining-clusters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/remaining-clusters.ts#L206)
- `rg` over [remaining-clusters.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content/remaining-clusters.ts) for common pain-language terms returned no matches

## §16 Minimum Quality Checklist

Checked against the representative sample above.

- one clear user problem per guide: pass
- introduction useful and specific: pass
- explains both why and how: pass
- adjustment steps practical: pass
- includes warnings or common mistakes: pass
- language easy to understand: pass
- at least one strong internal link: pass
- relevant CTA: pass
- reflects BestBikeFit4U fit logic and positioning: pass
- cyclist would learn something useful: pass

## Regression Checks

- fallback non-authored guide path still works: covered in [page.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.test.tsx#L548)
- authored guide content still overrides template fallback: covered in [content.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/guides/content.test.ts#L34)
- richer markdown/article guide rendering still works for DB-backed guides: covered in [page.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.test.tsx#L454)

## Final QA Decision

Task 047 passes.

Goal 09 is ready to close.
