import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";
import { prepareProduction } from "../final-sweep/production.mjs";
import { analyzeDutchText, collectDutchLanguage } from "../final-sweep/nl-language.mjs";

const root = process.cwd();
const outputDir = resolve("plans/redesign-canvas/code-renders/40c-nl");
await mkdir(outputDir, { recursive: true });
const production = await prepareProduction({ root, outputDir, port: 4356 });
const bundle = resolve(production.snapshot, "marketing-nl-data.cjs");
await build({ bundle: true, platform: "node", format: "cjs", outfile: bundle,
  absWorkingDir: production.snapshot, stdin: { loader: "ts", resolveDir: production.snapshot,
    contents: 'export {getGuideBacklog} from "./src/lib/guides/backlog";'
      + 'export {getDutchGuideTitle} from "./src/i18n/marketing/guideTitles";' } });
const { getGuideBacklog, getDutchGuideTitle } = createRequire(import.meta.url)(bundle);
const routes = [...new Set([
  ...getGuideBacklog("nl").map((entry) => entry.path),
  "/", "/pricing", "/how-it-works", "/measurement-guide", "/fit-pass", "/pain",
  "/about", "/faq", "/contact", "/privacy", "/terms", "/case-study", "/blog",
  "/science/calculation-engine", "/why-bikefit-matters", "/bikefitting", "/fiets-afstellen",
])];
const cases = [];
const browser = await chromium.launch({ headless: true });
try {
  let cursor = 0;
  const queue = routes.flatMap((route) => [1440, 390].map((width) => ({ route, width })));
  async function worker() {
    while (cursor < queue.length) {
      const { route, width } = queue[cursor++];
      const context = await browser.newContext({ locale: "nl-NL", ignoreHTTPSErrors: true,
        viewport: { width, height: 1000 }, reducedMotion: "reduce" });
      const row = { route, width, findings: [], guideLinkMismatches: [] };
      try {
        const page = await context.newPage();
        const response = await page.goto(`${production.origin}/nl${route === "/" ? "" : route}`,
          { waitUntil: "load", timeout: 60000 });
        row.status = response.status();
        await page.locator("form").evaluateAll((forms) => forms.forEach((form) => form.checkValidity()));
        for (const chunk of await collectDutchLanguage(page)) {
          const detection = analyzeDutchText(chunk.text);
          if (detection) row.findings.push({ kind: chunk.kind, text: chunk.text, detection });
        }
        const links = await page.locator('a[href*="/guides/"]').evaluateAll((anchors) =>
          anchors.map((anchor) => ({ href: anchor.getAttribute("href"), text: anchor.textContent.trim() })));
        for (const link of links) {
          if (["NL", "EN", "Open gids", "Lees de gids", "Bekijk de gidsen"].includes(link.text)) continue;
          const slug = link.href.match(/^\/(?:nl\/)?guides\/([^?#/]+)\/?(?:[?#].*)?$/)?.[1];
          const expected = slug && getDutchGuideTitle(slug);
          if (expected && !link.text.includes(expected)) row.guideLinkMismatches.push({ ...link, expected });
        }
      } catch (error) { row.error = error.message; }
      cases.push(row);
      await context.close();
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
} finally {
  await browser.close();
  await production.close();
}
const report = { sourceHash: production.sourceHash, routes: routes.length,
  limitations: ["English detection is heuristic; names, citations and CMS text require human review.",
    "Public initial states only; form errors and EN behavior covered by unit tests."], cases };
await writeFile(resolve("plans/redesign-canvas/audit/40c-browser.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ cases: cases.length,
  errors: cases.filter((row) => row.error || row.status !== 200).map(({ route, width, status, error }) =>
    ({ route, width, status, error })),
  linkMismatchCases: cases.filter((row) => row.guideLinkMismatches.length).length,
  findingCases: cases.filter((row) => row.findings.length).length }, null, 2));
if (cases.some((row) => row.error || row.status !== 200)) process.exitCode = 1;
