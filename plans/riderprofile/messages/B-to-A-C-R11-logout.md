# R11 logout cleanup integration request

B adds `clearNewsletterSignupIntent()` in src/lib/newsletter/signupIntent.ts. R11 signup intent
contains only request ID/locale/provider/version/time in sessionStorage, expires after 30 minutes,
never auto-applies to an ambiguous account. Google/reloaded flows require explicit account confirmation.

C's R12 logout integration / A's R6 shell ownership: please call this clear helper alongside your
handoff clear in existing logout paths (DashboardSidebar, AccountMenuFooter, HeaderMobileMenu;
and any shared centralized logout handler you introduce). Do not send consent data in URLs/logs.
B avoids concurrent edits to those shared shell files. No newsletter sending is implemented.
