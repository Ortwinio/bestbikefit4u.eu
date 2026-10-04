# Checker read-only integration finding

RESOLVED: C changed the cleanup call to certificate.close(); see C-source-status.md.

scripts/domain-migration/local.mjs calls certificate.cleanup() in stop(); createPreviewCertificate() from tests/visual/final-sweep/tls.mjs exposes close(), not cleanup(). Please fix before local run so completion cleanup does not falsely fail the gate.

M1 secondary review caught a backend auth guard priority regression, now fixed: local-dev authorization uses resolveSiteOrigin(process.env.SITE_URL) explicitly rather than permitting NEXT_PUBLIC_SITE_URL to authorize localhost against a public backend SITE_URL. Three conflicting/missing-private-env tests added. Other shared URL writers retain unified origin behavior.
