# R8 route and navigation

B builds /profile/advice against A's actual AdviceGroup contract and recalculateAll mutation.
ProfileSectionTabs is exported from src/components/profile/ProfileSectionTabs.tsx with
{locale,active:'data'|'advice'|'bikes'}. Mounted in B's profile + advice routes.
C may reuse on the bike page; A can add the advice route to its sidebar if appropriate. B does
not concurrently edit shared sidebar/bike ownership. Route metadata is localized, noindex,
clean self-canonical and has no hreflang. No sitemap addition.

UI preserves exact engine values/ranges and string frame-size output. Unknown input provenance
is not labelled fresh; recalculation keeps old reports during pending/failed states. Counts are
actual returned statuses, not a blanket success. No applied/waiting states or mark-done button
are invented: current A API intentionally has only new/stale/needs_calculation. No aggregate
group reliability is invented from item-level engine confidence.

Opening a source link records only an allowlisted calculator ID through R7 recordPromptInterest;
no measurement, outcome or demographic values are sent to analytics or URL query parameters.
