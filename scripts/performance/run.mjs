import { readFile, writeFile, mkdir, readdir, copyFile, mkdtemp } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { findPerformanceBrowser } from "./browser.mjs";
import { summarize, markdown, compactReport } from "./report.mjs";
const root = process.cwd();
const args = Object.fromEntries(process.argv.slice(2).map(arg => arg.replace(/^--/, "").split(/=(.*)/s).slice(0, 2)));
const base = new URL(args.base ?? "http://127.0.0.1:4100");
if (!["127.0.0.1", "localhost", "[::1]"].includes(base.hostname)) throw new Error("Only a local production origin is supported");
const label = args.label ?? "baseline";
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Use a simple lowercase label");
const config = JSON.parse(await readFile(resolve(root, "lighthouserc.json"), "utf8"));
config.ci.collect.url = config.ci.collect.url.map(url => new URL(new URL(url).pathname, base).href);
if (base.protocol === "https:") config.ci.collect.settings.chromeFlags += " --ignore-certificate-errors";
const output = resolve(root, `plans/seo-semrush/audit/S10-${label}`);
await mkdir(output, { recursive: true });
const work = await mkdtemp(join(tmpdir(), "bbf-lhci-"));
const configPath = join(work, "config.json");
await writeFile(configPath, JSON.stringify(config, null, 2));
for (const url of config.ci.collect.url) {
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  if (response.status !== 200) throw new Error(`Preflight ${url}: HTTP ${response.status}`);
}
const chromePath = await findPerformanceBrowser();
console.log(`Lighthouse browser: ${chromePath}`);
const command = async phase => {
  const child = spawn(process.execPath, [resolve(root, "node_modules/@lhci/cli/src/cli.js"), phase, `--config=${configPath}`], {
    cwd: work, env: { ...process.env, CHROME_PATH: chromePath }, stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  for (const stream of [child.stdout, child.stderr]) stream.on("data", chunk => { log += chunk; process.stdout.write(chunk); });
  const code = await new Promise((done, reject) => { child.on("error", reject); child.on("close", done); });
  await writeFile(join(output, `${phase}.log`), log);
  return code;
};
const collectCode = await command("collect");
const assertCode = collectCode === 0 ? await command("assert") : null;
const reports = [];
const rawOutput = join(tmpdir(), `bbf-s10-raw-${label}`);
await mkdir(rawOutput, { recursive: true });
for (const file of await readdir(join(work, ".lighthouseci")).catch(() => [])) {
  if (!/^lhr-.*\.json$/.test(file)) continue;
  const path = join(work, ".lighthouseci", file);
  reports.push(JSON.parse(await readFile(path, "utf8")));
  await copyFile(path, join(rawOutput, file));
  await writeFile(join(output, file), JSON.stringify(compactReport(reports.at(-1)), null, 2) + "\n");
}
const summary = summarize(reports, config.ci.collect.url, config.ci.collect.numberOfRuns);
await writeFile(join(output, "summary.json"), JSON.stringify({ label, collectedAt: new Date().toISOString(), collectCode, assertCode,
  settings: config.ci.collect.settings, summary }, null, 2) + "\n");
await writeFile(join(output, "summary.md"), markdown(summary, label));
process.exitCode = collectCode || assertCode || (summary.every(row => row.pass) ? 0 : 1);
