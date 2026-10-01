import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";
import { prepareProduction } from "../final-sweep/production.mjs";
import { runGuideAudit } from "../guides-audit/audit.mjs";

const outputDir = resolve("plans/redesign-canvas/code-renders/44b-D");
await mkdir(outputDir, { recursive: true });
const production = await prepareProduction({ outputDir, port: 4355 });
let browser;
try {
  const bundle = resolve(production.snapshot, "batch-d-guides.cjs");
  await build({ bundle: true, platform: "node", format: "cjs", outfile: bundle,
    absWorkingDir: production.snapshot, stdin: { loader: "ts", resolveDir: production.snapshot,
      contents: 'export {batchDGuides} from "./src/lib/guides/content/batch-d";' } });
  const { batchDGuides } = createRequire(import.meta.url)(bundle);
  const report = await runGuideAudit({ base: production.origin, fetchImpl: production.fetch,
    filter: batchDGuides.map((guide) => guide.slug), output: "plans/redesign-canvas/audit/44b-D-audit" });
  browser = await chromium.launch({ headless: true });
  const cases = [];
  for (const guide of batchDGuides) {
    for (const locale of ["nl", "en"]) {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({ ignoreHTTPSErrors: true,
          viewport: { width, height: 1000 }, reducedMotion: "reduce" });
        const page = await context.newPage();
        const route = `/${locale}/guides/${guide.slug}`;
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const response = await page.goto(`${production.origin}${route}`, { waitUntil: "networkidle" });
        const essential = page.getByRole("button", {
          name: locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true,
        });
        if (await essential.isVisible()) await essential.click();
        await page.evaluate(() => document.fonts.ready);
        await page.locator('[data-guide-source="code-rewrite"] header img').evaluate((img) => img.decode());
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        const source = await page.locator('[data-guide-source="code-rewrite"]').count();
        await page.screenshot({ path: resolve(outputDir, `${guide.slug}-${locale}-${width}.png`), fullPage: true });
        cases.push({ route, width, status: response.status(), overflow, source, errors });
        await context.close();
      }
    }
    console.log(`Captured ${guide.slug}`);
  }
  const failures = report.rows.flatMap((row) => Object.entries(row.checks)
    .filter(([, passed]) => !passed).map(([check]) => `${row.locale}/${row.slug}: ${check}`));
  const result = { sourceHash: production.sourceHash, buildId: production.buildId,
    snapshot: production.snapshot, cases, auditFailures: failures };
  await writeFile("plans/redesign-canvas/audit/44b-D-browser.json", `${JSON.stringify(result, null, 2)}\n`);
  const browserFailures = cases.filter((row) => row.status !== 200
    || row.overflow || row.source !== 1 || row.errors.length);
  console.log(JSON.stringify({ cases: cases.length, auditFailures: failures, browserFailures }));
  if (failures.length || browserFailures.length) {
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  await production.close();
}
