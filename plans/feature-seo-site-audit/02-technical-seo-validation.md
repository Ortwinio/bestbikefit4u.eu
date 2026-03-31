# Step 02: Technical SEO Validation

## Objective

Validate the technical SEO layer already present in the application and identify real implementation gaps.

## Tasks

1. Inspect:
   - `src/app/layout.tsx`
   - `src/i18n/metadata.ts`
   - `src/app/sitemap*.xml/route.ts`
   - `src/lib/seo/sitemap/*`
   - `src/proxy.ts`
2. Validate rules for:
   - `metadataBase`
   - canonical generation
   - `hreflang` / alternates
   - robots/indexability
   - preview noindex behavior
   - sitemap index and child sitemap completeness
   - XML headers and cache behavior
3. Run or document use of:
   - `node scripts/seo/validate-sitemaps.mjs`
   - targeted local HTTP checks where useful
4. Identify mismatches between:
   - actual route inventory
   - sitemap sources
   - metadata implementation

## Output

Create `output-02-technical-findings.md` with findings ordered by severity:
- severity
- area
- affected routes/files
- observed behavior
- expected behavior
- recommended fix

## Acceptance Checks

- canonicals, alternates, sitemap coverage, and preview robots are each evaluated explicitly
- findings reference concrete files or routes
- at least one validation path is executable, not just theoretical

