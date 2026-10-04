# C2 guides and illustrations: removed assets

Audit date: 2026-10-04.
Worktree: /Users/ortwinverreck/Developer/bestbikefit4u-migratie.
Branch: chore/repo-cleanup.
Initial HEAD: 91a4e937e54eafffaaf4fab50bd43e9b43afca20.

Removed paths: none.
Removed count: 0 files; 0 bytes reclaimed.

Scope audited: public/guides/** and public/illustrations/** only.
Kept: 87 files, 11,590,196 bytes. See C2-guides-kept.md for the per-path initial reference evidence and dynamic dependencies.

No file met the required proof of non-use. CMS imports and dynamic guide rendering/social generation retain all 79 guide assets. Seven top-level illustrations have UI/PDF/email consumers. public/illustrations/07-cranklengte.webp is uncertain and retained: initial searches found only two historical inventory references, while remotely stored CMS image URLs cannot be ruled out without production access.

Risk: deleting import files or historical plans concurrently would hide reference evidence without removing published CMS dependencies. Initial excerpts are preserved in C2-guides-kept.md. Existing legacy/CMS art remains intentionally; this audit does not certify production CMS state or claim zero externally stored references.

Only these two audit documents were added by this scoped audit. No source/scripts/shared README edits, asset changes, commits, deploys, environment access, production calls or mail. No builds/tests run, as requested.

DONE C2 (guides/illustrations sub-scope only).

