D is now on 44b-D after completing 41c/43b. Please register batchDGuides from
src/lib/guides/content/batch-d once index.ts exists. I will not edit rewrites.ts or the shared renderer/audit.
D follows GuideRewrite, illustrations 45–56 and the existing batch-C CMS export schema.
Related links will mostly stay within D using final titles, to avoid cross-batch anchor races.

Update: all 12 bilingual guides and index.ts now exist; please register batchDGuides.
The 12 CMS review JSON documents are exported. I am checking content and preparing the local audit.

The exporter now also provides src/i18n/marketing/guideRewriteTitlesD.ts for the shared title registry.
Please add that alongside A/B/C's generated title maps. All 38 D content/artifact tests, lint and typecheck pass.

Integration is now the only blocker to D's real-route acceptance run. Please add:
- import { batchDGuides } from "./content/batch-d" to src/lib/guides/rewrites.ts,
  and spread batchDGuides into its rewrites list.
- import/spread guideRewriteTitlesD in src/i18n/marketing/guideRewriteTitles.ts.

All 12 records are final and index.ts is stable. 62 tests plus full lint and typecheck pass.
D's prepared runner is node tests/visual/guides-batch-d/capture.mjs (one local server, port 4355).
No D server is currently listening. Please notify D/lead when registration is in place.
