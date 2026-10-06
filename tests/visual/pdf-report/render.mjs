import { build } from "esbuild";
import { mkdir, mkdtemp, symlink, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { renderBoard } from "./board.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = resolve(root, process.env.PDF_RENDER_OUTPUT_DIR ?? "plans/reliability/renders/pdf");
await mkdir(output, { recursive: true });
const temp = await mkdtemp(join(tmpdir(), "bbf26-render-"));
await symlink(resolve(root, "node_modules"), join(temp, "node_modules"), "dir");
const bundle = join(temp, "report.mjs");
await build({
  stdin: {
    contents: `export { reportPdfFixture as report, reportPdfFullFixture as fullReport }
      from './tests/fixtures/reportPdf';
      export { getReportV2Copy } from './src/lib/reports/reportV2Copy';
      export { renderPdfReportHtml } from './src/lib/reports/pdfLayoutTemplate';
      export { renderPdfFromHtml } from './src/lib/pdf/htmlPdf';
      export { getPdfReportAssets } from './src/lib/reports/pdfAssets';`,
    resolveDir: root,
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
const audit = [];
const variantsOnly = process.env.PDF_VARIANTS_ONLY === "true";
try {
  if (!variantsOnly)
    for (const { locale, fixture, report } of ["nl", "en"].flatMap((locale) => [
      { locale, fixture: "baseline", report: api.report },
      { locale, fixture: "full", report: api.fullReport },
    ])) {
      const prefix = fixture === "full" ? "26-full" : "26";
      const html = api.renderPdfReportHtml({ report, copy: api.getReportV2Copy(locale) });
      await writeFile(join(output, `${prefix}-report-${locale}.html`), html);
      const { pdf } = await api.renderPdfFromHtml({ html, pageLayout: "fixed-a4" });
      await writeFile(join(output, `${prefix}-report-${locale}.pdf`), pdf);
      const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, javaScriptEnabled: false });
      await page.route("**/*", (route) => route.abort());
      await page.setContent(html, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const sheets = page.locator(".report-page");
      const measurements = await sheets.evaluateAll((nodes) =>
        nodes.map((node) => {
          const content = node.querySelector(".report-content");
          const footer = node.querySelector(".report-footer").getBoundingClientRect();
          const children = [...content.children].flatMap((child) => [child, ...child.querySelectorAll("*")]);
          const bottom = Math.max(
            ...children
              .filter((child) => getComputedStyle(child).position !== "absolute")
              .map((child) => child.getBoundingClientRect().bottom),
          );
          return {
            board: node.dataset.board,
            contentBottom: bottom,
            footerTop: footer.top,
            overflow: bottom > footer.top + 1 || content.scrollWidth > content.clientWidth + 1,
          };
        }),
      );
      for (let i = 0; i < (await sheets.count()); i++) {
        await sheets.nth(i).screenshot({ path: join(output, `${prefix}-html-${locale}-${i + 1}.png`) });
      }
      audit.push({ locale, fixture, sheets: await sheets.count(), measurements });
      await page.close();
    }
  for (const locale of ["nl", "en"]) {
    for (const variant of ["sparse", "long-input", "warning-budget"]) {
      const report = structuredClone(api.report);
      if (variant === "sparse") {
        for (const key of Object.keys(report.rider)) report.rider[key] = null;
        report.bike.name = "";
        report.detailedFit = [];
        report.prioritySummary = [];
        report.adjustmentSequence = [];
        report.fitNotes = [];
        report.tirePressure = {
          status: "pending_required_inputs",
          required: ["tireWidth", "tireType"],
          quickStartTable: [],
        };
      } else {
        report.rider.name = "Alexandra Wilhelmina van den Berg de Vries-Schoenmaker Maria Elisabeth Christina II";
        report.bike.name = "Specialized S-Works Roubaix SL8 Expert Endurance Carbon Custom Edition Racing Bikes";
        report.profile.sessionId = "session_" + "0123456789abcdef".repeat(4).slice(0, 56);
        report.fitNotes = [
          "Keep a record of comfort and changes during every ride. ".repeat(60),
          "Validate each adjustment gradually before changing another component. ".repeat(60),
        ];
        if (variant === "warning-budget") {
          report.fitNotes = [
            "Keep a relaxed grip and check comfort on a familiar route. ".repeat(2),
            "Record the result before changing another setting. ".repeat(2),
          ];
        }
        if (report.tirePressure.status === "ready") {
          report.tirePressure.warnings =
            variant === "warning-budget"
              ? [
                  "Follow all stated tire and rim limits. ".repeat(3),
                  "Use the same gauge for repeat measurements. ".repeat(2),
                ]
              : ["Check the maximum tire and rim pressure. ".repeat(60)];
        }
      }
      const html = api.renderPdfReportHtml({ report, copy: api.getReportV2Copy(locale) });
      await writeFile(join(temp, `26-${variant}-${locale}.html`), html);
      const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, javaScriptEnabled: false });
      await page.route("**/*", (route) => route.abort());
      await page.setContent(html, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const sheets = page.locator(".report-page");
      const measurements = await sheets.evaluateAll((nodes) =>
        nodes.map((node) => {
          const content = node.querySelector(".report-content");
          const footerNode = node.querySelector(".report-footer");
          const footer = footerNode.getBoundingClientRect();
          const children = [...content.querySelectorAll("*")];
          const bottom = Math.max(
            ...children
              .filter((child) => getComputedStyle(child).position !== "absolute")
              .map((child) => child.getBoundingClientRect().bottom),
          );
          const horizontalOverflow =
            content.scrollWidth > content.clientWidth + 1 || footerNode.scrollWidth > footerNode.clientWidth + 1;
          return {
            board: node.dataset.board,
            contentBottom: bottom,
            footerTop: footer.top,
            horizontalOverflow,
            overflow: bottom > footer.top + 1 || horizontalOverflow,
          };
        }),
      );
      await page.pdf({
        path: join(temp, `26-${variant}-${locale}.pdf`),
        preferCSSPageSize: true,
        printBackground: true,
      });
      await sheets.first().screenshot({ path: join(temp, `26-${variant}-${locale}-summary.png`) });
      audit.push({ locale, variant, sheets: await sheets.count(), measurements, artifacts: temp });
      await page.close();
    }
  }
  const { images, fontCss } = api.getPdfReportAssets();
  const assets = {
    f578a7da9edb51aedfd68b4b11ad2bac: images.logo,
    f97f95df74480418d0ba68c1aaae7927: images.bikeDimensions,
    "616a6fd4acae3b1b368623d2c7fb3270": images.stackReach,
    e120bb19580fbfa9f8393d2f534d637c: images.measureSet,
    "3a2bdf1c78de6da9e979d7aff8c0598b": images.pressure,
  };
  if (!variantsOnly)
    for (let board = 1; board <= 6; board++) {
      let html = await readFile(resolve(root, `plans/redesign-canvas/canvas/FitRapport${board}.dc.html`), "utf8");
      html = html
        .replace(/<link[^>]*>/g, "")
        .replace("</head>", `<style>${fontCss}</style></head>`)
        .replace(/\/_blob\/([a-z0-9]+)/g, (_, id) => assets[id] ?? "");
      const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
      await page.route("**/*", (route) => route.abort());
      await renderBoard(page, html);
      await page.screenshot({ path: join(output, `26-board-${board}.png`) });
      await page.close();
    }
} finally {
  await browser.close();
}
await writeFile(
  variantsOnly ? join(temp, "26-variants.json") : join(output, "26-browser.json"),
  JSON.stringify(audit, null, 2),
);
console.log(JSON.stringify(audit));
if (audit.some((row) => row.sheets !== 6 || row.measurements.some((page) => page.overflow))) process.exitCode = 1;
