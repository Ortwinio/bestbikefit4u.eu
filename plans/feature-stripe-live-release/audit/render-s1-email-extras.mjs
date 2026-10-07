import { build } from "esbuild";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = "/Users/ortwinverreck/Developer/bikefitboost-stripe";
const output = join(root, "plans/feature-stripe-live-release/audit/email-extras");
await mkdir(output, { recursive: true });
await writeFile(join(output, ".gitignore"), "*\n!.gitignore\n");
const temp = await mkdtemp(join(tmpdir(), "s1-email-extras-"));
const bundle = join(temp, "templates.mjs");
await build({ stdin: { contents: 'export * from "./convex/emails/templates/pricing"; export * from "./convex/emails/templates/transitionReminder"; export { PRODUCTS } from "./shared/pricing/products";', resolveDir: root, loader: "ts" }, outfile: bundle, bundle: true, platform: "node", format: "esm" });
const templates = await import(pathToFileURL(bundle).href);
const checks = [];
const inventory = [];
async function record(name) {
  inventory.push({ file: name, sha256: createHash("sha256").update(await readFile(join(output, name))).digest("hex") });
}
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (/^\/(?:email\/[a-z0-9-]+|brand\/png\/logo-horizontaal-960)\.png$/.test(url.pathname)) {
      await route.fulfill({ body: await readFile(join(root, "public", url.pathname)), contentType: "image/png" });
    } else await route.abort();
  });
  for (const locale of ["nl", "en"]) {
    const agenda = "https://example.invalid/agenda";
    const cases = {
      datedTransitionAnnouncement: templates.renderTransitionAnnouncement({ firstName: "Alex", launchAt: Date.UTC(2026, 10, 7), daysUntilLaunch: 14, eligibleTransitionOffer: false, actionUrl: `https://example.invalid/${locale}/pricing` }, locale),
      senderSinglePurchase: templates.renderPurchaseConfirmation({ firstName: "Alex", productId: "single", bikeName: "Road bike", amountPaid: templates.PRODUCTS.single.priceCents / 100, accessEndsAt: Date.UTC(2027, 0, 7), actionUrl: `https://example.invalid/${locale}/fit` }, locale),
      senderRenewalReminder: templates.renderRenewalReminder({ firstName: "Alex", renewalAt: Date.UTC(2026, 10, 7), daysUntilRenewal: 30, cancellationUrl: `https://example.invalid/${locale}/settings`, actionUrl: `https://example.invalid/${locale}/settings` }, locale),
      senderAccessExpired: templates.renderAccessExpired({ firstName: "Alex", bikeName: "Road bike", actionUrl: `https://example.invalid/${locale}/pricing` }, locale),
      senderCancellation: templates.renderCancellationConfirmation({ firstName: "Alex", accessEndsAt: Date.UTC(2026, 9, 7), refundAmount: 10.75, actionUrl: `https://example.invalid/${locale}/settings` }, locale),
      transitionReminder: templates.renderTransitionReminder({ redeemBy: Date.UTC(2026, 10, 14), actionUrl: `https://example.invalid/${locale}/fit` }, locale),
      annualPersonalWelcome: templates.renderSubscriptionWelcome({ firstName: "Alex", accessEndsAt: Date.UTC(2027, 9, 7), appointmentUrl: agenda, actionUrl: `https://example.invalid/${locale}/settings` }, locale),
      standalonePurchase: templates.renderPurchaseConfirmation({ firstName: "Alex", productId: "personal_fit_standalone", amountPaid: templates.PRODUCTS.personal_fit_standalone.priceCents / 100, actionUrl: agenda }, locale),
    };
    for (const [kind, email] of Object.entries(cases)) {
      const name = `${kind}-${locale}`;
      await writeFile(join(output, `${name}.html`), email.html);
      await writeFile(join(output, `${name}.txt`), `${email.subject}\n\n${email.preheader}\n\n${email.text}\n`);
      await record(`${name}.html`);
      await record(`${name}.txt`);
      for (const width of [375, 600]) {
        await page.setViewportSize({ width, height: 900 });
        await page.setContent(email.html, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const result = await page.evaluate(() => ({ lang: document.documentElement.lang, scrollWidth: document.documentElement.scrollWidth, failedImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).length, placeholders: /\[(LOCATIE|DUUR AFSPRAAK|VOORWAARDEN AFSPRAAK|AGENDALINK)/.test(document.body.textContent), links: [...document.querySelectorAll("a")].map(link => link.href) }));
        if (result.lang !== locale || result.scrollWidth > width || result.failedImages || result.placeholders) throw new Error(`Layout/content failure ${name} ${width}`);
        if (["annualPersonalWelcome", "standalonePurchase"].includes(kind) && !result.links.some(link => link === agenda)) throw new Error(`Agenda missing ${name}`);
        if (kind === "datedTransitionAnnouncement" && /\[(DATE|DATUM)\]/.test(email.text)) throw new Error(`Launch date missing ${name}`);
        if (kind === "senderSinglePurchase" && /attached|factuur zit als PDF/.test(email.text)) throw new Error(`Incorrect attachment claim ${name}`);
        checks.push({ kind, locale, width, ...result });
        await page.screenshot({ path: join(output, `${name}-${width}.png`), fullPage: true });
        await record(`${name}-${width}.png`);
      }
    }
  }
} finally {
  await browser.close();
}
await writeFile(join(output, "checks.json"), JSON.stringify(checks, null, 2) + "\n");
await record("checks.json");
await writeFile(join(output, "inventory.json"), JSON.stringify(inventory, null, 2) + "\n");
console.log(`Rendered ${checks.length} supplemental screenshots with SHA-256 inventory; no mail sent.`);
