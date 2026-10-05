import { build } from "esbuild";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const outputArg = process.argv.find(arg => arg.startsWith("--output="))?.slice("--output=".length)
  ?? process.argv.slice(2).find(arg => !arg.startsWith("--"));
const output = resolve(root, outputArg ?? process.env.EMAIL_PREVIEW_OUTPUT ?? "artifacts/email-previews");
await mkdir(output, { recursive: true });
await writeFile(join(output, ".gitignore"), "*\n!.gitignore\n");
const temp = await mkdtemp(join(tmpdir(), "bbf-email-previews-"));
const bundle = join(temp, "templates.mjs");
await build({
  stdin: {
    contents: `export * from "./convex/emails/templates/index";
      export { sampleData } from "./convex/emails/templates/sampleData";`,
    resolveDir: root, loader: "ts",
  },
  outfile: bundle, bundle: true, platform: "node", format: "esm",
});
const templates = await import(pathToFileURL(bundle).href);
const kinds = [
  "loginCode", "resultsSummary", "fitReport", "fitPassWelcome", "caseStudyLead",
  "caseStudyConfirmation", "fitReminder", "upgradeNudge", "winback", "proExplainer", "day1Tips",
  "day7CheckIn", "day14Evaluation",
  "purchaseConfirmation", "subscriptionWelcome", "accessExpired", "renewalReminder",
  "cancellationConfirmation", "transitionAnnouncement", "giftMeasurement",
];
const browser = await chromium.launch({ headless: true });
const checks = [];
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  // Preview hosted assets directly from this worktree. Never sends mail or requests remote resources.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (/^\/(?:email\/[a-z0-9-]+|brand\/png\/logo-horizontaal-960)\.png$/.test(url.pathname)) {
      await route.fulfill({ body: await readFile(join(root, "public", url.pathname)), contentType: "image/png" });
    } else {
      await route.abort();
    }
  });
  for (const locale of ["nl", "en"]) {
    const data = templates.sampleData(locale);
    for (const kind of kinds) {
      const render = templates[`render${kind[0].toUpperCase()}${kind.slice(1)}`];
      const email = render(data[kind], locale);
      const name = `${kind}-${locale}`;
      await writeFile(join(output, `${name}.html`), email.html);
      await writeFile(join(output, `${name}.txt`), `${email.subject}\n\n${email.preheader}\n\n${email.text}\n`);
      for (const width of [600, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.setContent(email.html, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const result = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          scrollWidth: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          failedImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth)
            .map((image) => image.getAttribute("src")),
          layoutViolations: [...document.querySelectorAll("*")].filter((element) =>
            ["flex", "inline-flex", "grid", "inline-grid"].includes(getComputedStyle(element).display)).length,
        }));
        checks.push({ kind, locale, width, ...result });
        if (result.scrollWidth > width || result.failedImages.length || result.layoutViolations) {
          throw new Error(`Preview layout/asset check failed: ${name} at ${width}: ${JSON.stringify(result)}`);
        }
        await page.screenshot({ path: join(output, `${name}-${width}.png`), fullPage: true });
      }
    }
  }
} finally {
  await browser.close();
}
await writeFile(join(output, "checks.json"), JSON.stringify(checks, null, 2) + "\n");
console.log(`Rendered ${kinds.length * 2} bilingual HTML/text previews and ${checks.length} screenshots in ${output}`);
