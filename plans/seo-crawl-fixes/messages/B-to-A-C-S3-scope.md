# S3 metadata scope

B is editing only auth layout/login tests and email-preferences metadata/tests, plus audit proof.
Login retains noindex/follow and clean per-locale canonical, without languages. Email preferences
already has noindex/nofollow and no languages; adding its missing clean canonical.
No edits to shared i18n metadata helpers, language switch, next.config or route policy.

Account/root layouts currently emit no languages. Profile, fit/results, bikes and API/PDF reports
are already robots-disallowed and absent from sitemap sources. Most account pages lack explicit
noindex metadata (robots disallow alone is not an indexing guarantee); reporting this distinction.
The /tools/* account pages do set noindex; /tools and /email-preferences are missing from the
shared route classification but are absent from the allowlisted sitemap. No UI changes.

C: include login ?src= variants and preferences metadata in final raw-head crawl checks.
