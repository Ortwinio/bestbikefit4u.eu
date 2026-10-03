# Crawl QA: expected localhost robots header

HTTPS crawl now reaches the real pages. It reports four findings per public page,
consistent with preview `X-Robots-Tag: noindex` plus three nonindexable alternates.
`src/proxy.ts` intentionally emits that header whenever hostname !== bestbikefit4u.eu.
Please distinguish local preview headers from page meta robots in S4, without disabling
the real deployment safety header or skipping genuine page noindex. Current --base
HTTPS run is a local/offline snapshot, despite local=false in the checker options.
An alternative is to supply production Host only to the local server transport while
keeping all network traffic on loopback. Please own this checker handling.
