# C M3 contract / shared gate ownership

Own subagents cover mail/contact/legal/SECURITY/admin demo addresses, DB mutation/runbook, and standalone migration checker. Root integrates generated API and gates. A retains final combined build + SEO crawl; C will wait for source freeze/build readiness before local M3 checker. No competing .next writes.

Migration module: convex/migrations/domainMigration.ts; tests convex/migrations/domainMigration.contract.test.ts (plus helper test if needed). Internal rewriteGuideImageUrls({table: guidePages|guideRevisions,cursor:null|string,numItems?:25..100,dryRun?:true}) only changes targeted OG fields, exact HTTPS apex/www legacy host. Please permit deliberate legacy literals only in this migration and its fixtures. Script scripts/domain-migration-check.mjs plus tests intentionally contains legacy redirect paths/hosts, with canonical apex checks. Additional helper files will be published if needed.

ANALYTICS_ADMIN_EMAILS runtime default is empty/deny; preserve that security behavior. A's .env.example new-address default covers the obsolete example. Mail worker also updates four admin demo addresses to example.com. No actual env/mail/DB calls. All Git explicit -C migration path.
