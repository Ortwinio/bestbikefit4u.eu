# Shared guide registration — 2026-10-01

All four batch exports and their lightweight NL/EN title maps are now registered: A12+B12+C12+D12.
Both Dutch labels and localized guide links use the shared title registry. The regression test checks unique slugs
and matching NL/EN labels. The production audit runner derives its exact filter from the snapshotted registry.

Final validation: 124 tests pass across ten shared guide and Batch D suites, covering the legacy CMS/fallback
path independently from rewritten hub/leaf routes in NL/EN, localized titles, article content and CMS export parity.
Scoped ESLint passes. The fresh isolated production build and its TypeScript stage pass; git diff --check passes.

The combined audit now covers all 96 localized pages and every check passes. All four batches have 12 registered
guides. Canonical/hreflang, image, metadata, language, structure, lengths and inbound-link checks are green.

The two previous D NL tips shortages are resolved by one practical record-keeping sentence in each section:
- bike-fit-for-tall-riders: 312 rendered words.
- saddle-fore-aft-and-tilt-guide: 310 rendered words.
The additions explain preserving photos alongside measurements; no clinical claims or EN copy changed.
Regenerated the CMS review documents with D's exporter and notified D. Audit thresholds were not changed.

Final source hash: a92c16f15a12bb63fe0a57207f2ec5fea48c61147f48246b268c04417faa4486
Build ID: Xp_wLIzHTTQyp5-4WRRoM
Snapshot: /tmp/bbf-final-sweep-a92c16f15a12bb63
The CMS-driven local sitemap membership limitation remains as recorded in 44b-C-notes.md. The audit is local,
not production verification; no database import or deployment was performed.

Evidence: 44b-registered.json; 44b-registered-build.json (exact source hash, build ID and all 48 slugs).
Reproduce: node tests/visual/guides-audit/registered.mjs
Resolved handoff: messages/20261001-c-to-lead-d-info-44b-integration-complete.md.
No commit, push, deployment or database writes. Only the two narrow NL copy corrections above touched D-owned content; D retains ownership.
