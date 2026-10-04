import { build } from "esbuild";
import { mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const output = resolve("plans/rebrand/renders");
await mkdir(output, { recursive: true });
const temporary = await mkdtemp(join(tmpdir(), "bikefitboost-example-"));
await symlink(resolve("node_modules"), join(temporary, "node_modules"), "dir");
const bundle = join(temporary, "report.mjs");
await build({
  stdin: {
    contents: `export { reportPdfFullFixture as report } from './tests/fixtures/reportPdf';
      export { getReportV2Copy } from './src/lib/reports/reportV2Copy';
      export { renderPdfReportHtml } from './src/lib/reports/pdfLayoutTemplate';`,
    resolveDir: process.cwd(),
    loader: "ts",
  },
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
});
const api = await import(pathToFileURL(bundle).href);
const browser = await chromium.launch({ headless: true });
try {
  for (const locale of ["nl", "en"]) {
    const html = api.renderPdfReportHtml({ report: api.report, copy: api.getReportV2Copy(locale) });
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    await page.route("**/*", (route) => route.abort());
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    const filename = join(output, `bikefitboost-report-example-${locale}`);
    await writeFile(`${filename}.html`, html);
    await page.pdf({ path: `${filename}.pdf`, format: "A4", printBackground: true });
    const sheets = page.locator(".report-page");
    for (let index = 0; index < await sheets.count(); index++) {
      await sheets.nth(index).screenshot({ path: `${filename}-${index + 1}.png` });
    }
    await page.close();
    console.log(`Saved ${filename}.pdf`);
  }
} finally {
  await browser.close();
}
