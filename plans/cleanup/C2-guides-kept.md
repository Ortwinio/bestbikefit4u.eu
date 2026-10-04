# C2 guides and illustrations: kept assets

Audit date: 2026-10-04. Worktree: /Users/ortwinverreck/Developer/bestbikefit4u-migratie.
Branch verified: chore/repo-cleanup. Initial HEAD: 91a4e937e54eafffaaf4fab50bd43e9b43afca20.

Decision: KEEP all 87 assets (11,590,196 bytes): 31 guide PNGs, 48 guide WebP illustrations, and 8 top-level WebP illustrations. No asset was edited or deleted.

## Evidence method and concurrency

Read AGENTS.md and plans/cleanup/README.md; no nested AGENTS.md was found. Context index reports an older completed task; messages contains only README and TEMPLATE.

Initial searches ran before this audit was written, with hidden and ignored repository text included. Used rg --files for both scoped directories, then rg -n --hidden --no-ignore -F with one pattern per asset basename without its extension. This catches full public paths, URL paths, bare filenames and extensionless illustration identifiers. Searched the entire working repository, including source, Convex, scripts, tests, workflows, JSON/CMS imports, docs, plans and public text. Excluded node_modules, .next, .git, .env*, tsconfig.tsbuildinfo and this cleanup audit to avoid dependencies, generated output, environment access and self-references. The focused basename search returned 2,726 matching lines; every asset had at least one text match. Historical audit inventory matches alone are not evidence of runtime use.

Also inspected directory-prefix references and dynamic construction, CMS rendering, email asset generation, PDF embedding, social-image generation and manifests. Binary image/PDF contents were not decoded: this is a conservative KEEP audit, not a claim that absent text matches prove non-use. No production/CMS connection was made.

The per-path excerpts below were captured from the initial working tree, including plans that another agent may subsequently remove. They preserve the actual matched text and original path/line, rather than relying on later searches of a reduced tree. Initial HEAD identifies the recoverable committed baseline. Deleting an import artifact or old plan does not prove that its previously published image URL is unused.

## Dynamic and indirect references

- scripts/images/generate-social.mjs:6-9 enumerates public/illustrations/guides for .webp files and public/guides/media for .png/.webp/.jpg/.jpeg files. It constructs URL paths from each filename, reads public + source, and writes corresponding /og images plus src/lib/seo/social-images.json. All 79 assets in these two subdirectories are inputs.
- src/components/guides/RewrittenGuide.tsx:23 constructs `/illustrations/guides/${guide.illustration}.webp`; the guide content modules store extensionless identifiers. The same hero is used for the article image and structured data.
- src/lib/guides/rewrites.ts:9 combines batches A-D; :52 extracts an illustration basename from CMS heroImagePublicPath using the /illustrations/guides/*.webp pattern, overriding the code fallback.
- src/app/(public)/guides/[slug]/page.tsx:205,214 builds social images from rewritten.illustration; :235-236 and :349-350 consume the CMS hero path; :390 renders dbGuide.heroImagePublicPath with /illustrations/03-cockpit-afstellen.webp as fallback.
- convex/guides/mutations.ts:157,161 stores heroImagePublicPath and featuredImageUrl; :250,254 accepts optional string fields. Repository imports cannot establish which previously stored CMS URLs are still live.
- Guide content tests in src/lib/guides/content/batch-a/batch-a.test.ts:94, batch-b/content.test.ts:90 and batch-d/batch-d.test.ts:89 read `public/illustrations/guides/${guide.illustration}.webp`.
- src/lib/reports/pdfAssets.ts:10-11 dynamically joins process.cwd(), public and a relative path. Lines 16-18 embed illustrations/04-bandenspanning.webp, illustrations/06-meetset.webp and illustrations/08-stack-en-reach.webp. next.config.ts:22-24 explicitly includes these files in the server bundle.
- scripts/email-assets/generate.mjs:18-25 maps measuring-kit to 06-meetset.webp, tyre to 04-bandenspanning.webp and stack-reach to 08-stack-en-reach.webp, then joins public/illustrations with the filename to generate the protected email PNGs. Email assets and their source art must remain.
- convex/blog/shared.ts:15 and convex/blog/mutations.ts:71,171 accept/store a CMS featuredImageUrl; src/components/blog/BlogPresentation.tsx consumes the image field. Thus a repository-only scan cannot rule out a remotely stored reference to otherwise unreferenced public artwork.
- Package/workflow, email, PDF and manifest text were included in the full search. Protected brand, email, OG, favicon and manifest assets were not changed.

## Uncertain asset retained

public/illustrations/07-cranklengte.webp (47,222 bytes) has only two observed basename matches: the historical before/after inventories quoted below. No direct source, test, script, workflow, CMS import, email or PDF reference was found by that scan. It is outside the social generator's guides subdirectory enumeration. This is a candidate for a future audit, NOT proven unused: arbitrary CMS image fields and historical externally published URLs remain unverified under the no-production-access constraint. Keep under the user's when-in-doubt rule. Its similarly themed 36-cranklengte.webp is a different asset; similarity does not establish safe replacement.

## Per-path initial evidence

Each row is a KEEP decision. Guide PNGs remain because CMS import data records their public hero paths and social generation enumerates them; guide WebPs remain because code/CMS identifiers feed dynamic rendering and social generation. Top-level files have direct UI/PDF/email consumers except the explicitly uncertain 07-cranklengte.webp. Excerpts are preserved verbatim below each path.

### public/guides/media/001--guides-hero.png

Size: 210079 bytes. Initial basename/stem matches: 16.

```text
./docs/cms-import/en/001-en-guides.json:55:  "heroImagePublicPath": "/guides/media/001--guides-hero.png"
./docs/cms-import/nl/001--guides.json:55:  "heroImagePublicPath": "/guides/media/001--guides-hero.png"
./docs/cms-import/total/001-en-guides.json:55:  "heroImagePublicPath": "/guides/media/001--guides-hero.png"
```

### public/guides/media/002--guides--pain-and-discomfort-hero.png

Size: 246745 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/002-en-guides--pain-and-discomfort.json:54:  "heroImagePublicPath": "/guides/media/002--guides--pain-and-discomfort-hero.png"
./docs/cms-import/nl/002--guides--pain-and-discomfort.json:54:  "heroImagePublicPath": "/guides/media/002--guides--pain-and-discomfort-hero.png"
./docs/cms-import/total/002--guides--pain-and-discomfort.json:54:  "heroImagePublicPath": "/guides/media/002--guides--pain-and-discomfort-hero.png"
```

### public/guides/media/003--guides--bike-fitting-for-knee-pain-hero.png

Size: 219492 bytes. Initial basename/stem matches: 33.

```text
./src/lib/seo/social-image.test.ts:11:    const source = "/guides/media/003--guides--bike-fitting-for-knee-pain-hero.png";
./src/lib/seo/social-image.test.ts:13:      url: "https://bikefitboost.com/og/guides/media/003--guides--bike-fitting-for-knee-pain-hero.jpg",
./plans/feature-cms-guide-pages/README.md:765:| `heroImagePublicPath` | `heroImagePublicPath` | Public path, e.g. `/guides/media/003--guides--bike-fitting-for-knee-pain-hero.png` |
```

### public/guides/media/004--guides--bike-fitting-for-lower-back-pain-hero.png

Size: 246958 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/004-en-guides--bike-fitting-for-lower-back-pain.json:52:  "heroImagePublicPath": "/guides/media/004--guides--bike-fitting-for-lower-back-pain-hero.png"
./docs/cms-import/nl/004--guides--bike-fitting-for-lower-back-pain.json:52:  "heroImagePublicPath": "/guides/media/004--guides--bike-fitting-for-lower-back-pain-hero.png"
./docs/cms-import/total/004--guides--bike-fitting-for-lower-back-pain.json:52:  "heroImagePublicPath": "/guides/media/004--guides--bike-fitting-for-lower-back-pain-hero.png"
```

### public/guides/media/005--guides--bike-fit-for-neck-and-shoulder-pain-hero.png

Size: 205707 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/005-en-guides--bike-fit-for-neck-and-shoulder-pain.json:53:  "heroImagePublicPath": "/guides/media/005--guides--bike-fit-for-neck-and-shoulder-pain-hero.png"
./docs/cms-import/nl/005--guides--bike-fit-for-neck-and-shoulder-pain.json:53:  "heroImagePublicPath": "/guides/media/005--guides--bike-fit-for-neck-and-shoulder-pain-hero.png"
./docs/cms-import/total/005--guides--bike-fit-for-neck-and-shoulder-pain.json:53:  "heroImagePublicPath": "/guides/media/005--guides--bike-fit-for-neck-and-shoulder-pain-hero.png"
```

### public/guides/media/006--guides--bike-fit-for-hand-numbness-and-wrist-pain-hero.png

Size: 230483 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/006-en-guides--bike-fit-for-hand-numbness-and-wrist-pain.json:53:  "heroImagePublicPath": "/guides/media/006--guides--bike-fit-for-hand-numbness-and-wrist-pain-hero.png"
./docs/cms-import/nl/006--guides--bike-fit-for-hand-numbness-and-wrist-pain.json:53:  "heroImagePublicPath": "/guides/media/006--guides--bike-fit-for-hand-numbness-and-wrist-pain-hero.png"
./docs/cms-import/total/006--guides--bike-fit-for-hand-numbness-and-wrist-pain.json:53:  "heroImagePublicPath": "/guides/media/006--guides--bike-fit-for-hand-numbness-and-wrist-pain-hero.png"
```

### public/guides/media/007--guides--bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores-hero.png

Size: 233049 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/007-en-guides--bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores.json:53:  "heroImagePublicPath": "/guides/media/007--guides--bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores-hero.png"
./docs/cms-import/nl/007--guides--bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores.json:53:  "heroImagePublicPath": "/guides/media/007--guides--bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores-hero.png"
./docs/cms-import/total/007--guides--bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores.json:53:  "heroImagePublicPath": "/guides/media/007--guides--bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores-hero.png"
```

### public/guides/media/008--guides--bike-fit-for-foot-pain-hot-foot-and-numb-toes-hero.png

Size: 191262 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/008-en-guides--bike-fit-for-foot-pain-hot-foot-and-numb-toes.json:53:  "heroImagePublicPath": "/guides/media/008--guides--bike-fit-for-foot-pain-hot-foot-and-numb-toes-hero.png"
./docs/cms-import/nl/008--guides--bike-fit-for-foot-pain-hot-foot-and-numb-toes.json:53:  "heroImagePublicPath": "/guides/media/008--guides--bike-fit-for-foot-pain-hot-foot-and-numb-toes-hero.png"
./docs/cms-import/total/008-en-guides--bike-fit-for-foot-pain-hot-foot-and-numb-toes.json:53:  "heroImagePublicPath": "/guides/media/008--guides--bike-fit-for-foot-pain-hot-foot-and-numb-toes-hero.png"
```

### public/guides/media/009--guides--ride-types-hero.png

Size: 241244 bytes. Initial basename/stem matches: 25.

```text
./src/app/(public)/guides/[slug]/page.test.tsx:239:        heroImagePublicPath: "/guides/media/009--guides--ride-types-hero.png",
./docs/cms-import/en/009-en-guides--ride-types.json:53:  "heroImagePublicPath": "/guides/media/009--guides--ride-types-hero.png"
./docs/cms-import/nl/009--guides--ride-types.json:53:  "heroImagePublicPath": "/guides/media/009--guides--ride-types-hero.png"
```

### public/guides/media/010--guides--road-bike-fit-guide-hero.png

Size: 215537 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/010-en-guides--road-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/010--guides--road-bike-fit-guide-hero.png"
./docs/cms-import/nl/010--guides--road-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/010--guides--road-bike-fit-guide-hero.png"
./docs/cms-import/total/010--guides--road-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/010--guides--road-bike-fit-guide-hero.png"
```

### public/guides/media/011--guides--gravel-bike-fit-guide-hero.png

Size: 207891 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/011-en-guides--gravel-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/011--guides--gravel-bike-fit-guide-hero.png"
./docs/cms-import/nl/011--guides--gravel-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/011--guides--gravel-bike-fit-guide-hero.png"
./docs/cms-import/total/011-en-guides--gravel-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/011--guides--gravel-bike-fit-guide-hero.png"
```

### public/guides/media/012--guides--mountain-bike-fit-guide-hero.png

Size: 242179 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/012-en-guides--mountain-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/012--guides--mountain-bike-fit-guide-hero.png"
./docs/cms-import/nl/012--guides--mountain-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/012--guides--mountain-bike-fit-guide-hero.png"
./docs/cms-import/total/012-en-guides--mountain-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/012--guides--mountain-bike-fit-guide-hero.png"
```

### public/guides/media/013--guides--triathlon-bike-fit-guide-hero.png

Size: 249977 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/013-en-guides--triathlon-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/013--guides--triathlon-bike-fit-guide-hero.png"
./docs/cms-import/nl/013--guides--triathlon-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/013--guides--triathlon-bike-fit-guide-hero.png"
./docs/cms-import/total/013--guides--triathlon-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/013--guides--triathlon-bike-fit-guide-hero.png"
```

### public/guides/media/014--guides--endurance-bike-fit-guide-hero.png

Size: 224725 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/014-en-guides--endurance-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/014--guides--endurance-bike-fit-guide-hero.png"
./docs/cms-import/nl/014--guides--endurance-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/014--guides--endurance-bike-fit-guide-hero.png"
./docs/cms-import/total/014--guides--endurance-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/014--guides--endurance-bike-fit-guide-hero.png"
```

### public/guides/media/015--guides--indoor-trainer-bike-fit-guide-hero.png

Size: 202273 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/015-en-guides--indoor-trainer-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/015--guides--indoor-trainer-bike-fit-guide-hero.png"
./docs/cms-import/nl/015--guides--indoor-trainer-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/015--guides--indoor-trainer-bike-fit-guide-hero.png"
./docs/cms-import/total/015-en-guides--indoor-trainer-bike-fit-guide.json:53:  "heroImagePublicPath": "/guides/media/015--guides--indoor-trainer-bike-fit-guide-hero.png"
```

### public/guides/media/016--guides--rider-profiles-hero.png

Size: 201308 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/016-en-guides--rider-profiles.json:53:  "heroImagePublicPath": "/guides/media/016--guides--rider-profiles-hero.png"
./docs/cms-import/nl/016--guides--rider-profiles.json:53:  "heroImagePublicPath": "/guides/media/016--guides--rider-profiles-hero.png"
./docs/cms-import/total/016-en-guides--rider-profiles.json:53:  "heroImagePublicPath": "/guides/media/016--guides--rider-profiles-hero.png"
```

### public/guides/media/017--guides--bike-fit-for-tall-riders-hero.png

Size: 211757 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/017-en-guides--bike-fit-for-tall-riders.json:53:  "heroImagePublicPath": "/guides/media/017--guides--bike-fit-for-tall-riders-hero.png"
./docs/cms-import/nl/017--guides--bike-fit-for-tall-riders.json:53:  "heroImagePublicPath": "/guides/media/017--guides--bike-fit-for-tall-riders-hero.png"
./docs/cms-import/total/017-en-guides--bike-fit-for-tall-riders.json:53:  "heroImagePublicPath": "/guides/media/017--guides--bike-fit-for-tall-riders-hero.png"
```

### public/guides/media/018--guides--bike-fit-for-riders-with-a-shorter-torso-hero.png

Size: 248582 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/018-en-guides--bike-fit-for-riders-with-a-shorter-torso.json:53:  "heroImagePublicPath": "/guides/media/018--guides--bike-fit-for-riders-with-a-shorter-torso-hero.png"
./docs/cms-import/nl/018--guides--bike-fit-for-riders-with-a-shorter-torso.json:53:  "heroImagePublicPath": "/guides/media/018--guides--bike-fit-for-riders-with-a-shorter-torso-hero.png"
./docs/cms-import/total/018--guides--bike-fit-for-riders-with-a-shorter-torso.json:53:  "heroImagePublicPath": "/guides/media/018--guides--bike-fit-for-riders-with-a-shorter-torso-hero.png"
```

### public/guides/media/019--guides--bike-fit-for-riders-with-limited-flexibility-hero.png

Size: 199149 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/019-en-guides--bike-fit-for-riders-with-limited-flexibility.json:53:  "heroImagePublicPath": "/guides/media/019--guides--bike-fit-for-riders-with-limited-flexibility-hero.png"
./docs/cms-import/nl/019--guides--bike-fit-for-riders-with-limited-flexibility.json:53:  "heroImagePublicPath": "/guides/media/019--guides--bike-fit-for-riders-with-limited-flexibility-hero.png"
./docs/cms-import/total/019--guides--bike-fit-for-riders-with-limited-flexibility.json:53:  "heroImagePublicPath": "/guides/media/019--guides--bike-fit-for-riders-with-limited-flexibility-hero.png"
```

### public/guides/media/020--guides--bike-fit-for-beginners-and-returning-riders-hero.png

Size: 231231 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/020-en-guides--bike-fit-for-beginners-and-returning-riders.json:53:  "heroImagePublicPath": "/guides/media/020--guides--bike-fit-for-beginners-and-returning-riders-hero.png"
./docs/cms-import/nl/020--guides--bike-fit-for-beginners-and-returning-riders.json:53:  "heroImagePublicPath": "/guides/media/020--guides--bike-fit-for-beginners-and-returning-riders-hero.png"
./docs/cms-import/total/020-en-guides--bike-fit-for-beginners-and-returning-riders.json:53:  "heroImagePublicPath": "/guides/media/020--guides--bike-fit-for-beginners-and-returning-riders-hero.png"
```

### public/guides/media/021--guides--setup-parameters-hero.png

Size: 198659 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/021-en-guides--setup-parameters.json:54:  "heroImagePublicPath": "/guides/media/021--guides--setup-parameters-hero.png"
./docs/cms-import/nl/021--guides--setup-parameters.json:54:  "heroImagePublicPath": "/guides/media/021--guides--setup-parameters-hero.png"
./docs/cms-import/total/021--guides--setup-parameters.json:54:  "heroImagePublicPath": "/guides/media/021--guides--setup-parameters-hero.png"
```

### public/guides/media/022--guides--saddle-height-guide-hero.png

Size: 230435 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/022-en-guides--saddle-height-guide.json:53:  "heroImagePublicPath": "/guides/media/022--guides--saddle-height-guide-hero.png"
./docs/cms-import/nl/022--guides--saddle-height-guide.json:53:  "heroImagePublicPath": "/guides/media/022--guides--saddle-height-guide-hero.png"
./docs/cms-import/total/022--guides--saddle-height-guide.json:53:  "heroImagePublicPath": "/guides/media/022--guides--saddle-height-guide-hero.png"
```

### public/guides/media/023--guides--saddle-fore-aft-and-tilt-guide-hero.png

Size: 240310 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/023-en-guides--saddle-fore-aft-and-tilt-guide.json:53:  "heroImagePublicPath": "/guides/media/023--guides--saddle-fore-aft-and-tilt-guide-hero.png"
./docs/cms-import/nl/023--guides--saddle-fore-aft-and-tilt-guide.json:53:  "heroImagePublicPath": "/guides/media/023--guides--saddle-fore-aft-and-tilt-guide-hero.png"
./docs/cms-import/total/023-en-guides--saddle-fore-aft-and-tilt-guide.json:53:  "heroImagePublicPath": "/guides/media/023--guides--saddle-fore-aft-and-tilt-guide-hero.png"
```

### public/guides/media/024--guides--reach-and-stem-guide-hero.png

Size: 228533 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/024-en-guides--reach-and-stem-guide.json:53:  "heroImagePublicPath": "/guides/media/024--guides--reach-and-stem-guide-hero.png"
./docs/cms-import/nl/024--guides--reach-and-stem-guide.json:53:  "heroImagePublicPath": "/guides/media/024--guides--reach-and-stem-guide-hero.png"
./docs/cms-import/total/024-en-guides--reach-and-stem-guide.json:53:  "heroImagePublicPath": "/guides/media/024--guides--reach-and-stem-guide-hero.png"
```

### public/guides/media/025--guides--handlebar-drop-guide-hero.png

Size: 240228 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/025-en-guides--handlebar-drop-guide.json:53:  "heroImagePublicPath": "/guides/media/025--guides--handlebar-drop-guide-hero.png"
./docs/cms-import/nl/025--guides--handlebar-drop-guide.json:53:  "heroImagePublicPath": "/guides/media/025--guides--handlebar-drop-guide-hero.png"
./docs/cms-import/total/025--guides--handlebar-drop-guide.json:53:  "heroImagePublicPath": "/guides/media/025--guides--handlebar-drop-guide-hero.png"
```

### public/guides/media/026--guides--crank-length-guide-hero.png

Size: 240465 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/026-en-guides--crank-length-guide.json:53:  "heroImagePublicPath": "/guides/media/026--guides--crank-length-guide-hero.png"
./docs/cms-import/nl/026--guides--crank-length-guide.json:53:  "heroImagePublicPath": "/guides/media/026--guides--crank-length-guide-hero.png"
./docs/cms-import/total/026-en-guides--crank-length-guide.json:53:  "heroImagePublicPath": "/guides/media/026--guides--crank-length-guide-hero.png"
```

### public/guides/media/027--guides--handlebar-width-and-hood-position-guide-hero.png

Size: 189796 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/027-en-guides--handlebar-width-and-hood-position-guide.json:53:  "heroImagePublicPath": "/guides/media/027--guides--handlebar-width-and-hood-position-guide-hero.png"
./docs/cms-import/nl/027--guides--handlebar-width-and-hood-position-guide.json:53:  "heroImagePublicPath": "/guides/media/027--guides--handlebar-width-and-hood-position-guide-hero.png"
./docs/cms-import/total/027--guides--handlebar-width-and-hood-position-guide.json:53:  "heroImagePublicPath": "/guides/media/027--guides--handlebar-width-and-hood-position-guide-hero.png"
```

### public/guides/media/028--guides--shoe-foot-cleat-fit-hero.png

Size: 243868 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/028-en-guides--shoe-foot-cleat-fit.json:53:  "heroImagePublicPath": "/guides/media/028--guides--shoe-foot-cleat-fit-hero.png"
./docs/cms-import/nl/028--guides--shoe-foot-cleat-fit.json:53:  "heroImagePublicPath": "/guides/media/028--guides--shoe-foot-cleat-fit-hero.png"
./docs/cms-import/total/028-en-guides--shoe-foot-cleat-fit.json:53:  "heroImagePublicPath": "/guides/media/028--guides--shoe-foot-cleat-fit-hero.png"
```

### public/guides/media/029--guides--foot-measurement-guide-for-cyclists-hero.png

Size: 216992 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/029-en-guides--foot-measurement-guide-for-cyclists.json:53:  "heroImagePublicPath": "/guides/media/029--guides--foot-measurement-guide-for-cyclists-hero.png"
./docs/cms-import/nl/029--guides--foot-measurement-guide-for-cyclists.json:53:  "heroImagePublicPath": "/guides/media/029--guides--foot-measurement-guide-for-cyclists-hero.png"
./docs/cms-import/total/029-en-guides--foot-measurement-guide-for-cyclists.json:53:  "heroImagePublicPath": "/guides/media/029--guides--foot-measurement-guide-for-cyclists-hero.png"
```

### public/guides/media/030--guides--cycling-shoe-fit-width-and-last-guide-hero.png

Size: 230074 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/030-en-guides--cycling-shoe-fit-width-and-last-guide.json:53:  "heroImagePublicPath": "/guides/media/030--guides--cycling-shoe-fit-width-and-last-guide-hero.png"
./docs/cms-import/nl/030--guides--cycling-shoe-fit-width-and-last-guide.json:53:  "heroImagePublicPath": "/guides/media/030--guides--cycling-shoe-fit-width-and-last-guide-hero.png"
./docs/cms-import/total/030-en-guides--cycling-shoe-fit-width-and-last-guide.json:53:  "heroImagePublicPath": "/guides/media/030--guides--cycling-shoe-fit-width-and-last-guide-hero.png"
```

### public/guides/media/031--guides--cleat-position-basics-guide-hero.png

Size: 237394 bytes. Initial basename/stem matches: 24.

```text
./docs/cms-import/en/031-en-guides--cleat-position-basics-guide.json:54:  "heroImagePublicPath": "/guides/media/031--guides--cleat-position-basics-guide-hero.png"
./docs/cms-import/nl/031--guides--cleat-position-basics-guide.json:54:  "heroImagePublicPath": "/guides/media/031--guides--cleat-position-basics-guide-hero.png"
./docs/cms-import/total/031-en-guides--cleat-position-basics-guide.json:54:  "heroImagePublicPath": "/guides/media/031--guides--cleat-position-basics-guide-hero.png"
```

### public/illustrations/01-racefiets.webp

Size: 157868 bytes. Initial basename/stem matches: 15.

```text
./src/components/account/LoginPresentation.tsx:58:            src="/illustrations/01-racefiets.webp"
./src/components/science/editorial-pages.test.tsx:54:      [Why, "", "01-racefiets.webp"],
./src/app/(public)/pain/page.tsx:67:            src="/illustrations/01-racefiets.webp" width={568} height={370} alt={copy.indexImage} priority
```

### public/illustrations/02-zadelhoogte-meten.webp

Size: 177394 bytes. Initial basename/stem matches: 12.

```text
./src/components/account/ProfileWizardGuide.tsx:46:          <Image src="/illustrations/02-zadelhoogte-meten.webp" alt={profileWizardGuideImageAlt[locale]} width={420} height={280} className="h-auto w-full object-contain" />
./src/components/account/ProfileWizardGuide.test.tsx:13:    expect(image.getAttribute("src")).toContain("02-zadelhoogte-meten.webp");
./src/components/science/editorial-pages.test.tsx:50:      [Methods, editorialImageAlt[language].saddleHeight, "02-zadelhoogte-meten.webp"],
```

### public/illustrations/03-cockpit-afstellen.webp

Size: 79076 bytes. Initial basename/stem matches: 122.

```text
./src/components/science/EditorialLayout.tsx:27:  image = "/illustrations/03-cockpit-afstellen.webp",
./src/components/science/editorial-pages.test.tsx:49:      [Setup, editorialImageAlt[language].cockpit, "03-cockpit-afstellen.webp"],
./src/components/science/editorial-pages.test.tsx:53:      [language === "nl" ? DutchLanding : EnglishLanding, editorialImageAlt[language].cockpit, "03-cockpit-afstellen.webp"],
```

### public/illustrations/04-bandenspanning.webp

Size: 99562 bytes. Initial basename/stem matches: 9.

```text
./src/lib/reports/pdfAssets.ts:16:      pressure: embed("illustrations/04-bandenspanning.webp", "image/webp"),
./src/components/seo/PressureBikeLanding.tsx:34:      <Image src="/illustrations/04-bandenspanning.webp" alt={copy.illustration} width={392} height={350}
./plans/redesign-canvas/26-pdf-report.md:17:- Fonts: Bricolage Grotesque, Figtree and DM Mono must be **embedded** in the PDF (check `resourcePolicy.ts`: no external network from Chromium; bundle the fonts locally or as a data URI through the existing asset path). Logo: `public/brand/report/report-logo.svg`. Illustrations: `public/illustrations/04-bandenspanning.webp`, `06-meetset.webp`, `08-stack-en-reach.webp`.
```

### public/illustrations/05-gravel.webp

Size: 183382 bytes. Initial basename/stem matches: 3.

```text
./src/app/(public)/case-study/page.tsx:84:          <Image src="/illustrations/05-gravel.webp" alt={copy.image} width={600} height={440} priority />
./plans/redesign-canvas/audit/47-before.json:103:    "path": "public/illustrations/05-gravel.webp",
./plans/redesign-canvas/audit/47-after.json:79:    "path": "public/illustrations/05-gravel.webp",
```

### public/illustrations/06-meetset.webp

Size: 89398 bytes. Initial basename/stem matches: 26.

```text
./src/lib/reports/pdfAssets.ts:17:      measureSet: embed("illustrations/06-meetset.webp", "image/webp"),
./src/components/science/editorial-pages.test.tsx:51:      [Engine, editorialImageAlt[language].measuringKit, "06-meetset.webp"],
./src/app/(public)/measurement-guide/page.tsx:77:          <Image src="/illustrations/06-meetset.webp" alt={presentation.heroAlt}
```

### public/illustrations/07-cranklengte.webp

Size: 47222 bytes. Initial basename/stem matches: 2.

```text
./plans/redesign-canvas/audit/47-before.json:91:    "path": "public/illustrations/07-cranklengte.webp",
./plans/redesign-canvas/audit/47-after.json:67:    "path": "public/illustrations/07-cranklengte.webp",
```

### public/illustrations/08-stack-en-reach.webp

Size: 159518 bytes. Initial basename/stem matches: 11.

```text
./src/lib/reports/pdfAssets.ts:18:      stackReach: embed("illustrations/08-stack-en-reach.webp", "image/webp"),
./src/components/science/editorial-pages.test.tsx:52:      [Stack, editorialImageAlt[language].stackReach, "08-stack-en-reach.webp"],
./src/app/(public)/science/stack-and-reach/page.tsx:67:        image="/illustrations/08-stack-en-reach.webp"
```

### public/illustrations/guides/09-beginners-fietsafstelling.webp

Size: 121956 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:2:  "09-beginners-fietsafstelling": {
./plans/redesign-canvas/guides-import/bike-fit-for-beginners-and-returning-riders.json:225:  "heroImageFileName": "09-beginners-fietsafstelling.webp",
./plans/redesign-canvas/guides-import/bike-fit-for-beginners-and-returning-riders.json:226:  "heroImagePublicPath": "/illustrations/guides/09-beginners-fietsafstelling.webp",
```

### public/illustrations/guides/10-korte-romp-stuurafstand.webp

Size: 118138 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:8:  "10-korte-romp-stuurafstand": {
./plans/redesign-canvas/guides-import/bike-fit-for-riders-with-a-shorter-torso.json:219:  "heroImageFileName": "10-korte-romp-stuurafstand.webp",
./plans/redesign-canvas/guides-import/bike-fit-for-riders-with-a-shorter-torso.json:220:  "heroImagePublicPath": "/illustrations/guides/10-korte-romp-stuurafstand.webp",
```

### public/illustrations/guides/11-knie-pedaalbeweging.webp

Size: 117492 bytes. Initial basename/stem matches: 38.

```text
./plans/redesign-canvas/guides-import/bike-fitting-for-knee-pain.json:221:  "heroImageFileName": "11-knie-pedaalbeweging.webp",
./plans/redesign-canvas/guides-import/bike-fitting-for-knee-pain.json:222:  "heroImagePublicPath": "/illustrations/guides/11-knie-pedaalbeweging.webp",
./plans/redesign-canvas/guides-import/bike-fitting-for-knee-pain.json:223:  "featuredImageUrl": "/illustrations/guides/11-knie-pedaalbeweging.webp",
```

### public/illustrations/guides/12-schoenplaatjes-positie.webp

Size: 27308 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:20:  "12-schoenplaatjes-positie": {
./src/lib/guides/content/batch-a/cleat-position.ts:6:  "illustration": "12-schoenplaatjes-positie",
./plans/redesign-canvas/guides-import/cleat-position-basics-guide.json:252:  "heroImageFileName": "12-schoenplaatjes-positie.webp",
```

### public/illustrations/guides/13-fietsschoen-leestbreedte.webp

Size: 24492 bytes. Initial basename/stem matches: 38.

```text
./plans/redesign-canvas/guides-import/cycling-shoe-fit-width-and-last-guide.json:249:  "heroImageFileName": "13-fietsschoen-leestbreedte.webp",
./plans/redesign-canvas/guides-import/cycling-shoe-fit-width-and-last-guide.json:250:  "heroImagePublicPath": "/illustrations/guides/13-fietsschoen-leestbreedte.webp",
./plans/redesign-canvas/guides-import/cycling-shoe-fit-width-and-last-guide.json:251:  "featuredImageUrl": "/illustrations/guides/13-fietsschoen-leestbreedte.webp",
```

### public/illustrations/guides/14-framemaat-meetpunten.webp

Size: 128174 bytes. Initial basename/stem matches: 38.

```text
./plans/redesign-canvas/guides-import/frame-size-guide.json:222:  "heroImageFileName": "14-framemaat-meetpunten.webp",
./plans/redesign-canvas/guides-import/frame-size-guide.json:223:  "heroImagePublicPath": "/illustrations/guides/14-framemaat-meetpunten.webp",
./plans/redesign-canvas/guides-import/frame-size-guide.json:224:  "featuredImageUrl": "/illustrations/guides/14-framemaat-meetpunten.webp",
```

### public/illustrations/guides/15-stuurbreedte-remgrepen.webp

Size: 26232 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:38:  "15-stuurbreedte-remgrepen": {
./plans/redesign-canvas/guides-import/handlebar-width-and-hood-position-guide.json:223:  "heroImageFileName": "15-stuurbreedte-remgrepen.webp",
./plans/redesign-canvas/guides-import/handlebar-width-and-hood-position-guide.json:224:  "heroImagePublicPath": "/illustrations/guides/15-stuurbreedte-remgrepen.webp",
```

### public/illustrations/guides/16-inlegzool-voetboog.webp

Size: 30726 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:44:  "16-inlegzool-voetboog": {
./plans/redesign-canvas/guides-import/insoles-arch-support-and-footbeds-guide.json:249:  "heroImageFileName": "16-inlegzool-voetboog.webp",
./plans/redesign-canvas/guides-import/insoles-arch-support-and-footbeds-guide.json:250:  "heroImagePublicPath": "/illustrations/guides/16-inlegzool-voetboog.webp",
```

### public/illustrations/guides/17-vermogen-gelijkmatig-tempo.webp

Size: 117640 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:50:  "17-vermogen-gelijkmatig-tempo": {
./plans/redesign-canvas/guides-import/power-ftp-pacing.json:227:  "heroImageFileName": "17-vermogen-gelijkmatig-tempo.webp",
./plans/redesign-canvas/guides-import/power-ftp-pacing.json:228:  "heroImagePublicPath": "/illustrations/guides/17-vermogen-gelijkmatig-tempo.webp",
```

### public/illustrations/guides/18-lichaamsbouw-fietshouding.webp

Size: 124778 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:56:  "18-lichaamsbouw-fietshouding": {
./plans/redesign-canvas/guides-import/rider-profiles.json:217:  "heroImageFileName": "18-lichaamsbouw-fietshouding.webp",
./plans/redesign-canvas/guides-import/rider-profiles.json:218:  "heroImagePublicPath": "/illustrations/guides/18-lichaamsbouw-fietshouding.webp",
```

### public/illustrations/guides/19-zadelhoogte-beenhoek.webp

Size: 117926 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:62:  "19-zadelhoogte-beenhoek": {
./plans/redesign-canvas/guides-import/saddle-height-guide.json:221:  "heroImageFileName": "19-zadelhoogte-beenhoek.webp",
./plans/redesign-canvas/guides-import/saddle-height-guide.json:222:  "heroImagePublicPath": "/illustrations/guides/19-zadelhoogte-beenhoek.webp",
```

### public/illustrations/guides/20-standbreedte-pedalen.webp

Size: 30392 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/illustration-sources.json:68:  "20-standbreedte-pedalen": {
./plans/redesign-canvas/guides-import/stance-width-q-factor-and-pedal-spacer-guide.json:249:  "heroImageFileName": "20-standbreedte-pedalen.webp",
./plans/redesign-canvas/guides-import/stance-width-q-factor-and-pedal-spacer-guide.json:250:  "heroImagePublicPath": "/illustrations/guides/20-standbreedte-pedalen.webp",
```

### public/illustrations/guides/21-gevoelloze-tenen.webp

Size: 28492 bytes. Initial basename/stem matches: 39.

```text
./src/lib/guides/content/batch-b/foot-pain.ts:4:  illustration: "21-gevoelloze-tenen",
./plans/redesign-canvas/guides-import/bike-fit-for-foot-pain-hot-foot-and-numb-toes.json:232:  "heroImageFileName": "21-gevoelloze-tenen.webp",
./plans/redesign-canvas/guides-import/bike-fit-for-foot-pain-hot-foot-and-numb-toes.json:233:  "heroImagePublicPath": "/illustrations/guides/21-gevoelloze-tenen.webp",
```

### public/illustrations/guides/22-beperkte-flexibiliteit.webp

Size: 89668 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-b/limited-flexibility.ts:4:  illustration: "22-beperkte-flexibiliteit",
./src/lib/guides/content/illustration-sources.json:80:  "22-beperkte-flexibiliteit": {
./plans/redesign-canvas/guides-import/bike-fit-for-riders-with-limited-flexibility.json:227:  "heroImageFileName": "22-beperkte-flexibiliteit.webp",
```

### public/illustrations/guides/23-lage-rugpijn.webp

Size: 90444 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-b/lower-back.ts:4:  illustration: "23-lage-rugpijn",
./plans/redesign-canvas/guides-import/bike-fitting-for-lower-back-pain.json:229:  "heroImageFileName": "23-lage-rugpijn.webp",
./plans/redesign-canvas/guides-import/bike-fitting-for-lower-back-pain.json:230:  "heroImagePublicPath": "/illustrations/guides/23-lage-rugpijn.webp",
```

### public/illustrations/guides/24-klimtijd.webp

Size: 90722 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-b/climb-time.ts:4:  illustration: "24-klimtijd",
./src/lib/guides/content/illustration-sources.json:92:  "24-klimtijd": {
./plans/redesign-canvas/guides-import/climb-time-and-event-pacing-guide.json:229:  "heroImageFileName": "24-klimtijd.webp",
```

### public/illustrations/guides/25-lange-ritten.webp

Size: 92094 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-b/endurance.ts:4:  illustration: "25-lange-ritten",
./src/lib/guides/content/illustration-sources.json:98:  "25-lange-ritten": {
./plans/redesign-canvas/guides-import/endurance-bike-fit-guide.json:227:  "heroImageFileName": "25-lange-ritten.webp",
```

### public/illustrations/guides/26-ftp-meten.webp

Size: 100728 bytes. Initial basename/stem matches: 41.

```text
./src/lib/guides/content/batch-b/ftp.ts:4:  illustration: "26-ftp-meten",
./plans/redesign-canvas/guides-import/ftp-explained.json:230:  "heroImageFileName": "26-ftp-meten.webp",
./plans/redesign-canvas/guides-import/ftp-explained.json:231:  "heroImagePublicPath": "/illustrations/guides/26-ftp-meten.webp",
```

### public/illustrations/guides/27-fietsen-vergelijken.webp

Size: 124452 bytes. Initial basename/stem matches: 39.

```text
./src/lib/guides/content/batch-b/compare-bikes.ts:4:  illustration: "27-fietsen-vergelijken",
./plans/redesign-canvas/guides-import/how-to-compare-two-bikes-for-fit.json:223:  "heroImageFileName": "27-fietsen-vergelijken.webp",
./plans/redesign-canvas/guides-import/how-to-compare-two-bikes-for-fit.json:224:  "heroImagePublicPath": "/illustrations/guides/27-fietsen-vergelijken.webp",
```

### public/illustrations/guides/28-mountainbike-afstellen.webp

Size: 108274 bytes. Initial basename/stem matches: 43.

```text
./src/lib/guides/content/batch-b/mountain.ts:4:  illustration: "28-mountainbike-afstellen",
./src/lib/guides/content/illustration-sources.json:116:  "28-mountainbike-afstellen": {
./plans/redesign-canvas/guides-import/mountain-bike-fit-guide.json:223:  "heroImageFileName": "28-mountainbike-afstellen.webp",
```

### public/illustrations/guides/29-vermogen-snelheid.webp

Size: 91402 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-b/power-speed.ts:4:  illustration: "29-vermogen-snelheid",
./src/lib/guides/content/illustration-sources.json:122:  "29-vermogen-snelheid": {
./plans/redesign-canvas/guides-import/power-to-speed-guide.json:227:  "heroImageFileName": "29-vermogen-snelheid.webp",
```

### public/illustrations/guides/30-racefiets-afstellen.webp

Size: 89668 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-b/road.ts:4:  illustration: "30-racefiets-afstellen",
./src/lib/guides/content/illustration-sources.json:128:  "30-racefiets-afstellen": {
./plans/redesign-canvas/guides-import/road-bike-fit-guide.json:225:  "heroImageFileName": "30-racefiets-afstellen.webp",
```

### public/illustrations/guides/31-afstelmaten.webp

Size: 123386 bytes. Initial basename/stem matches: 39.

```text
./src/lib/guides/content/batch-b/setup.ts:4:  illustration: "31-afstelmaten",
./src/lib/guides/content/illustration-sources.json:134:  "31-afstelmaten": {
./plans/redesign-canvas/guides-import/setup-parameters.json:223:  "heroImageFileName": "31-afstelmaten.webp",
```

### public/illustrations/guides/32-triatlonhouding.webp

Size: 89154 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-b/triathlon.ts:4:  illustration: "32-triatlonhouding",
./plans/redesign-canvas/guides-import/triathlon-bike-fit-guide.json:223:  "heroImageFileName": "32-triatlonhouding.webp",
./plans/redesign-canvas/guides-import/triathlon-bike-fit-guide.json:224:  "heroImagePublicPath": "/illustrations/guides/32-triatlonhouding.webp",
```

### public/illustrations/guides/33-gevoelloze-handen.webp

Size: 26634 bytes. Initial basename/stem matches: 39.

```text
./src/components/guides/RewrittenGuide.test.tsx:43:    expect(article.image).toContain("/illustrations/guides/33-gevoelloze-handen.webp");
./src/lib/guides/content/batch-c/hand-numbness.ts:5:  illustration: "33-gevoelloze-handen",
./plans/redesign-canvas/guides-import/bike-fit-for-hand-numbness-and-wrist-pain.json:237:  "heroImageFileName": "33-gevoelloze-handen.webp",
```

### public/illustrations/guides/34-zadelsteun.webp

Size: 26588 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/batch-c/saddle-pressure.ts:4:  illustration: "34-zadelsteun",
./plans/redesign-canvas/guides-import/bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores.json:239:  "heroImageFileName": "34-zadelsteun.webp",
./plans/redesign-canvas/guides-import/bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores.json:240:  "heroImagePublicPath": "/illustrations/guides/34-zadelsteun.webp",
```

### public/illustrations/guides/35-fietsmaat-geometrie.webp

Size: 119660 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/batch-c/bike-size.ts:4:  illustration: "35-fietsmaat-geometrie",
./plans/redesign-canvas/guides-import/bike-size-and-geometry.json:233:  "heroImageFileName": "35-fietsmaat-geometrie.webp",
./plans/redesign-canvas/guides-import/bike-size-and-geometry.json:234:  "heroImagePublicPath": "/illustrations/guides/35-fietsmaat-geometrie.webp",
```

### public/illustrations/guides/36-cranklengte.webp

Size: 34150 bytes. Initial basename/stem matches: 42.

```text
./src/lib/guides/content/batch-c/crank-length.ts:4:  illustration: "36-cranklengte",
./src/lib/guides/content/illustration-sources.json:164:  "36-cranklengte": {
./plans/redesign-canvas/guides-import/crank-length-guide.json:232:  "heroImageFileName": "36-cranklengte.webp",
```

### public/illustrations/guides/37-bikefit-contactpunten.webp

Size: 109838 bytes. Initial basename/stem matches: 39.

```text
./src/lib/guides/content/batch-c/fit-science.ts:4:  illustration: "37-bikefit-contactpunten",
./src/lib/guides/content/illustration-sources.json:170:  "37-bikefit-contactpunten": {
./plans/redesign-canvas/guides-import/fit-science.json:239:  "heroImageFileName": "37-bikefit-contactpunten.webp",
```

### public/illustrations/guides/38-gravelbike-afstellen.webp

Size: 117426 bytes. Initial basename/stem matches: 39.

```text
./src/lib/guides/content/batch-c/gravel-fit.ts:4:  illustration: "38-gravelbike-afstellen",
./src/lib/guides/content/illustration-sources.json:176:  "38-gravelbike-afstellen": {
./plans/redesign-canvas/guides-import/gravel-bike-fit-guide.json:231:  "heroImageFileName": "38-gravelbike-afstellen.webp",
```

### public/illustrations/guides/39-zweetverlies-meten.webp

Size: 22128 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/batch-c/hydration.ts:4:  illustration: "39-zweetverlies-meten",
./plans/redesign-canvas/guides-import/hydration-and-sweat-rate-guide.json:237:  "heroImageFileName": "39-zweetverlies-meten.webp",
./plans/redesign-canvas/guides-import/hydration-and-sweat-rate-guide.json:238:  "heroImagePublicPath": "/illustrations/guides/39-zweetverlies-meten.webp",
```

### public/illustrations/guides/40-voeding-drinken.webp

Size: 27518 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/batch-c/nutrition.ts:4:  illustration: "40-voeding-drinken",
./plans/redesign-canvas/guides-import/nutrition-and-hydration.json:233:  "heroImageFileName": "40-voeding-drinken.webp",
./plans/redesign-canvas/guides-import/nutrition-and-hydration.json:234:  "heroImagePublicPath": "/illustrations/guides/40-voeding-drinken.webp",
```

### public/illustrations/guides/41-stuurpen-bereik.webp

Size: 28782 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/batch-c/reach-stem.ts:4:  illustration: "41-stuurpen-bereik",
./plans/redesign-canvas/guides-import/reach-and-stem-guide.json:231:  "heroImageFileName": "41-stuurpen-bereik.webp",
./plans/redesign-canvas/guides-import/reach-and-stem-guide.json:232:  "heroImagePublicPath": "/illustrations/guides/41-stuurpen-bereik.webp",
```

### public/illustrations/guides/42-race-endurance-geometrie.webp

Size: 120276 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/batch-c/race-endurance.ts:4:  illustration: "42-race-endurance-geometrie",
./plans/redesign-canvas/guides-import/road-vs-endurance-vs-race-geometry.json:239:  "heroImageFileName": "42-race-endurance-geometrie.webp",
./plans/redesign-canvas/guides-import/road-vs-endurance-vs-race-geometry.json:240:  "heroImagePublicPath": "/illustrations/guides/42-race-endurance-geometrie.webp",
```

### public/illustrations/guides/43-schoen-cleat.webp

Size: 17716 bytes. Initial basename/stem matches: 38.

```text
./src/lib/guides/content/batch-c/shoe-cleat.ts:4:  illustration: "43-schoen-cleat",
./plans/redesign-canvas/guides-import/shoe-foot-cleat-fit.json:233:  "heroImageFileName": "43-schoen-cleat.webp",
./plans/redesign-canvas/guides-import/shoe-foot-cleat-fit.json:234:  "heroImagePublicPath": "/illustrations/guides/43-schoen-cleat.webp",
```

### public/illustrations/guides/44-grenzen-online-bikefit.webp

Size: 108928 bytes. Initial basename/stem matches: 39.

```text
./src/lib/guides/content/batch-c/online-limits.ts:4:  illustration: "44-grenzen-online-bikefit",
./plans/redesign-canvas/guides-import/when-online-bike-fit-has-limits.json:233:  "heroImageFileName": "44-grenzen-online-bikefit.webp",
./plans/redesign-canvas/guides-import/when-online-bike-fit-has-limits.json:234:  "heroImagePublicPath": "/illustrations/guides/44-grenzen-online-bikefit.webp",
```

### public/illustrations/guides/45-nek-en-schouders.webp

Size: 114144 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/bike-fit-for-neck-and-shoulder-pain.ts:6:  illustration: "45-nek-en-schouders",
./src/lib/guides/content/illustration-sources.json:218:  "45-nek-en-schouders": {
./plans/redesign-canvas/guides-import/bike-fit-for-neck-and-shoulder-pain.json:229:  "heroImageFileName": "45-nek-en-schouders.webp",
```

### public/illustrations/guides/46-lange-fietser.webp

Size: 117082 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/bike-fit-for-tall-riders.ts:6:  illustration: "46-lange-fietser",
./src/lib/guides/content/illustration-sources.json:224:  "46-lange-fietser": {
./plans/redesign-canvas/guides-import/bike-fit-for-tall-riders.json:229:  "heroImageFileName": "46-lange-fietser.webp",
```

### public/illustrations/guides/47-koolhydraten-onderweg.webp

Size: 30482 bytes. Initial basename/stem matches: 30.

```text
./plans/redesign-canvas/guides-import/carbs-per-hour-guide.json:231:  "heroImageFileName": "47-koolhydraten-onderweg.webp",
./plans/redesign-canvas/guides-import/carbs-per-hour-guide.json:232:  "heroImagePublicPath": "/illustrations/guides/47-koolhydraten-onderweg.webp",
./plans/redesign-canvas/guides-import/carbs-per-hour-guide.json:233:  "featuredImageUrl": "/illustrations/guides/47-koolhydraten-onderweg.webp",
```

### public/illustrations/guides/48-eten-tijdens-fietsen.webp

Size: 38188 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/cycling-fueling-basics.ts:6:  illustration: "48-eten-tijdens-fietsen",
./src/lib/guides/content/illustration-sources.json:236:  "48-eten-tijdens-fietsen": {
./plans/redesign-canvas/guides-import/cycling-fueling-basics.json:229:  "heroImageFileName": "48-eten-tijdens-fietsen.webp",
```

### public/illustrations/guides/49-voet-opmeten.webp

Size: 21848 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/foot-measurement-guide-for-cyclists.ts:6:  illustration: "49-voet-opmeten",
./plans/redesign-canvas/guides-import/foot-measurement-guide-for-cyclists.json:229:  "heroImageFileName": "49-voet-opmeten.webp",
./plans/redesign-canvas/guides-import/foot-measurement-guide-for-cyclists.json:230:  "heroImagePublicPath": "/illustrations/guides/49-voet-opmeten.webp",
```

### public/illustrations/guides/50-stuurhoogte-en-drop.webp

Size: 50904 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/handlebar-drop-guide.ts:6:  illustration: "50-stuurhoogte-en-drop",
./src/lib/guides/content/illustration-sources.json:248:  "50-stuurhoogte-en-drop": {
./plans/redesign-canvas/guides-import/handlebar-drop-guide.json:231:  "heroImageFileName": "50-stuurhoogte-en-drop.webp",
```

### public/illustrations/guides/51-fiets-op-trainer.webp

Size: 98974 bytes. Initial basename/stem matches: 30.

```text
./plans/redesign-canvas/guides-import/indoor-trainer-bike-fit-guide.json:233:  "heroImageFileName": "51-fiets-op-trainer.webp",
./plans/redesign-canvas/guides-import/indoor-trainer-bike-fit-guide.json:234:  "heroImagePublicPath": "/illustrations/guides/51-fiets-op-trainer.webp",
./plans/redesign-canvas/guides-import/indoor-trainer-bike-fit-guide.json:235:  "featuredImageUrl": "/illustrations/guides/51-fiets-op-trainer.webp",
```

### public/illustrations/guides/52-pijn-en-contactpunten.webp

Size: 115004 bytes. Initial basename/stem matches: 30.

```text
./plans/redesign-canvas/guides-import/pain-and-discomfort.json:231:  "heroImageFileName": "52-pijn-en-contactpunten.webp",
./plans/redesign-canvas/guides-import/pain-and-discomfort.json:232:  "heroImagePublicPath": "/illustrations/guides/52-pijn-en-contactpunten.webp",
./plans/redesign-canvas/guides-import/pain-and-discomfort.json:233:  "featuredImageUrl": "/illustrations/guides/52-pijn-en-contactpunten.webp",
```

### public/illustrations/guides/53-fietstype-en-houding.webp

Size: 114720 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/ride-types.ts:6:  illustration: "53-fietstype-en-houding",
./src/lib/guides/content/illustration-sources.json:266:  "53-fietstype-en-houding": {
./plans/redesign-canvas/guides-import/ride-types.json:230:  "heroImageFileName": "53-fietstype-en-houding.webp",
```

### public/illustrations/guides/54-zadel-terugstand-kanteling.webp

Size: 21316 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/saddle-fore-aft-and-tilt-guide.ts:6:  illustration: "54-zadel-terugstand-kanteling",
./src/lib/guides/content/illustration-sources.json:272:  "54-zadel-terugstand-kanteling": {
./plans/redesign-canvas/guides-import/saddle-fore-aft-and-tilt-guide.json:230:  "heroImageFileName": "54-zadel-terugstand-kanteling.webp",
```

### public/illustrations/guides/55-natriumconcentratie.webp

Size: 25004 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/sodium-and-electrolytes-guide.ts:6:  illustration: "55-natriumconcentratie",
./src/lib/guides/content/illustration-sources.json:278:  "55-natriumconcentratie": {
./plans/redesign-canvas/guides-import/sodium-and-electrolytes-guide.json:229:  "heroImageFileName": "55-natriumconcentratie.webp",
```

### public/illustrations/guides/56-gewicht-en-vermogen.webp

Size: 29346 bytes. Initial basename/stem matches: 30.

```text
./src/lib/guides/content/batch-d/wkg-and-power-zones-guide.ts:6:  illustration: "56-gewicht-en-vermogen",
./plans/redesign-canvas/guides-import/wkg-and-power-zones-guide.json:232:  "heroImageFileName": "56-gewicht-en-vermogen.webp",
./plans/redesign-canvas/guides-import/wkg-and-power-zones-guide.json:233:  "heroImagePublicPath": "/illustrations/guides/56-gewicht-en-vermogen.webp",
```

