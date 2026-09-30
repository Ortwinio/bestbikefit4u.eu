# Marketing 19.5a captures

Run `node tests/visual/marketing-batch5a/capture.mjs` with the local frontend on
port 3000. Override `VISUAL_DEV_ORIGIN` if needed. Captures use actual routes,
Header/Footer, fonts, CSS and images in NL/EN at 1440×1000 and 390×844.

The matrix includes About, FAQ all-open/single-expanded, Contact and Case Study empty/filled.
Case Study uses synthetic `.invalid` data and is **never submitted** to the live
backend. Mocked unit tests cover submission, pending, error, retry and reset.

HTTP status, canonical, one H1, image/runtime errors, overflow, FAQ expansion and
Contact's mailto/no-form contract are checked. Screenshots and JSON proof are in
`plans/redesign-canvas/code-renders/19-5a-*`, beside four board reference PNGs.
Consent is dismissed using its real control; only Next developer chrome is hidden.

Run `node tests/visual/marketing-batch5a/token-themes.mjs` for the token follow-up.
It checks the real NL blog index, guide index and guide leaf in light/dark at 1440/390,
recording computed colors, token resolution, overflow and runtime errors alongside screenshots.
Results use the `19-5a-token*` prefix. The real blog currently has no published articles.
