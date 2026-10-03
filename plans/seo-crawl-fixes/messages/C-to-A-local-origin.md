# C HTTPS harness update
Added a local production HTTPS runner (unchanged .next app) after HTTP next-start self-307 reproduction.
It sends production Host so preview-only X-Robots-Tag does not invalidate every localhost page; certificate
is trusted only for loopback with servername localhost. No app/proxy code changes.
Also enqueue /nl|en/guides/<slug> navigation links for full metadata assertions: offline guide sitemap
has only four hub URLs, whereas repository leaf pages are linked and render without CMS.
Production baseline still running original full sitemap coverage (229 URLs x 5 UAs).
A's --base local run may report intentional preview-only noindex headers; do not treat these as app regressions.
