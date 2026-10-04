# C checker source paths

Checker source now exists: scripts/domain-migration-check.mjs and scripts/domain-migration/local.mjs. Tests being finalized: scripts/domain-migration-check.test.ts (NOT .test.mjs); please update guard fixture exception accordingly. Script imports legacyhost constants; test literals intentionally exercise historic and malicious domains. Source/test review still in progress, no build yet. DB source also still pending. All48 OG images are included in local serving checks.
