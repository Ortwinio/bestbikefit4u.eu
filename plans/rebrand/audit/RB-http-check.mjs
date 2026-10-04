import { request } from "node:http";
import { writeFile } from "node:fs/promises";
import { SITE_ORIGIN, LEGACY_SITE_HOSTS } from "../../../shared/brand.ts";

const port = Number(process.env.RB_PORT || "4370");
const records = [];
function fetchLocal(path, host = new URL(SITE_ORIGIN).host) {
  return new Promise((resolve, reject) => {
    const outgoing = request({ hostname: "127.0.0.1", port, path, method: "GET",
      headers: { host } }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers,
        body: Buffer.concat(chunks).toString("utf8") }));
    });
    outgoing.on("error", reject);
    outgoing.end();
  });
}
function check(name, passed, evidence) {
  records.push({ name, passed: Boolean(passed), evidence });
}
for (const host of LEGACY_SITE_HOSTS) {
  for (const path of ["/nl/guides/saddle-height-guide?source=rebrand&keep=1", "/en?src=old-host"]) {
    const response = await fetchLocal(path, host);
    check(`${host}${path}`, [301, 308].includes(response.status)
      && response.headers.location === `${SITE_ORIGIN}${path}`,
    { status: response.status, location: response.headers.location });
  }
}
for (const locale of ["nl", "en"]) {
  const response = await fetchLocal(`/${locale}`);
  const head = response.body.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  check(`${locale} canonical`, head.includes(`href="${SITE_ORIGIN}/${locale}"`), response.status);
  check(`${locale} brand`, head.includes('content="BikeFitBoost"') && !head.includes("BestBikeFit4U"), head.length);
  check(`${locale} social`, head.includes(`${SITE_ORIGIN}/og-image-1200x630.png`), "absolute OG image");
  check(`${locale} manifest`, head.includes('/site.webmanifest'), "static brand-set manifest");
  check(`${locale} icons`, head.includes('/favicon.svg') && head.includes('/apple-touch-icon.png'), "brand icons");
}
const response = await fetchLocal("/site.webmanifest");
const manifest = JSON.parse(response.body);
check("manifest standalone", manifest.name === "BikeFitBoost" && manifest.display === "standalone"
  && manifest.theme_color === "#0F2420" && Boolean(manifest.start_url), manifest);
for (const size of ["192x192", "512x512"]) {
  check(`manifest ${size}`, manifest.icons.some((icon) => icon.sizes === size), manifest.icons);
}
check("manifest maskable", manifest.icons.some((icon) => icon.sizes === "512x512" && icon.purpose === "maskable"), manifest.icons);
for (const path of ["/favicon.ico", "/favicon.svg", "/apple-touch-icon.png", "/og-image-1200x630.png",
  "/brand/png/logo-horizontaal-960.png"]) {
  const asset = await fetchLocal(path);
  check(`asset ${path}`, asset.status === 200, { status: asset.status, type: asset.headers["content-type"] });
}
const report = { checkedAt: new Date().toISOString(), origin: SITE_ORIGIN,
  passed: records.every((record) => record.passed), records };
await writeFile("plans/rebrand/audit/RB-http-check.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ passed: report.passed, checks: records.length,
  failures: records.filter((record) => !record.passed) }, null, 2));
process.exitCode = report.passed ? 0 : 1;
