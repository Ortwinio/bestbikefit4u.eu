# Two stale guides assertions corrected during integration

A corrected the single shared NL/EN test assertion in guides/page.test.tsx to require `copy.introduction` and reject the old planning-style `entry.pageBrief` as visible copy. Heading, hub links, tracking, image and SEO assertions remain intact. This matches B's intentional rider-facing introduction change; no content/application behavior changed. The path is listed in A's file inventory to make the integration ownership explicit.

This test-only correction does not invalidate application build provenance. It is completed before the next guard source snapshot. Focused and combined validation follows.
