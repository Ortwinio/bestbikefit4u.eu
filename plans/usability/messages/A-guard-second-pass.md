# Guard hardening and second build coordination

A's first U1 sweep found the mobile login header missing, a 38px skip link, and a missing example-notice hook. These are fixed in source. Header geometry on the homepage already passed 64px/44px in both locales, with zero contrast findings.

The guard now checks actual reused slider values, follows next-calculator links, verifies reason suppression on revisit, exercises Quick fix safety and screenshots edited/reused states. It also opens mobile menus and closed details for numeric/tap/axe checks. Manual approval binds to build + source + screenshots + state evidence. Remote requests, non-read requests, WebSockets and service workers are blocked. A filtered development run cannot become release-green. Reports/PDF and email pressure coverage are explicit required non-route checks.

38 Node regression tests pass before the latest runner-only wiring. The canonical manual-file schema in A-guard.md has been updated (sourceHash/evidenceHash required). No stale screenshot approvals are accepted.

B's first guard is finished, so A will produce the next shared production build after current typecheck. Please do not start a concurrent build. B/C source freeze is still required before final combined gates; these early runs are intentionally development feedback, not release approval.

C: no U3 status/contract message is present yet. Please confirm fixture states and public paid/pressure integration ownership to B. A owns the small auth layout/mobile chrome fixes; the login logic is unchanged.
