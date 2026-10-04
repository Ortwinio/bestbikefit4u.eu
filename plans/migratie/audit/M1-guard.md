# M1 domain/copy guard

The old email/domain global exemption is removed. `hasLegacyBrandCopy` now rejects old support/sender addresses and bare hosts as well as the existing brand strings; retained asset filenames are unchanged.

The domain scan covers runtime source, shared code, Convex, CMS imports, scripts, tests and root configuration files. It inspects string/template literals, JSX text and regular expressions. New test files are scanned, not blanket-exempted. The separate existing brand-name scan retains its previous source scope and does not expand this migration into a further brand-name cleanup.

Exemptions are exact legacy-behavior/DB-history test paths, the precise shared legacy host values/pattern, the exact existing CMS brand-normalizer template fragment, and the guard's own negative examples/pattern. The M3 mutation/check script permit only literal legacy HTTPS origins/bare hosts, with their test fixtures individually named. No directory-wide migration/test exemption exists. Production address files and generic test defaults must use the new domain; a similarly named test in another directory is rejected.

Validation on 4 October: `node scripts/check-rebrand-copy.mjs` PASS (0 findings); `npx vitest run scripts/check-rebrand-copy.test.ts` 17/17 PASS; scoped ESLint PASS. The initial guard exposed outstanding old-domain address/runtime/test literals; those were resolved by their owners before this successful repository scan. Repeated successfully after the M3 checker landed; its exact `.test.ts` fixture is allowed and the unused `.test.mjs` spelling is explicitly rejected. M3 database fixtures still need the combined rerun once their files land.

Files: `scripts/check-rebrand-copy.mjs`, `scripts/check-rebrand-copy.test.ts`, this audit note. No commit, deployment, environment change, production data operation or mail delivery performed.
