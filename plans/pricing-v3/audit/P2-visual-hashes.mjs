import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../renders/p2-visual");
const compareV2 = process.argv.includes("--v2");
const baselinePath = resolve(root, compareV2 ? "v2-screenshot-hashes.json" : "initial-screenshot-hashes.json");
const filenames = (await readdir(root)).filter(name => name.endsWith(".png")).sort();
const hashes = {};
for (const filename of filenames) {
  hashes[filename] = createHash("sha256").update(await readFile(resolve(root, filename))).digest("hex");
}
if (process.argv.includes("--baseline")) {
  const report = JSON.parse(await readFile(resolve(root, "report.json"), "utf8"));
  await writeFile(baselinePath, JSON.stringify({ buildId: report.buildId, cssProvenance: report.cssProvenance, hashes }, null, 2), { flag: "wx" });
  console.log(`Preserved ${filenames.length} screenshot hashes in ${baselinePath}`);
} else {
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const comparison = {
    unchanged: filenames.filter(name => hashes[name] === baseline.hashes[name]),
    changed: filenames.filter(name => baseline.hashes[name] && hashes[name] !== baseline.hashes[name]),
    added: filenames.filter(name => !baseline.hashes[name]),
    missing: Object.keys(baseline.hashes).filter(name => !hashes[name]),
    method: "Exact SHA256 bytes only; changed images require manual review. Equality does not override an unresolved initial finding.",
  };
  await writeFile(resolve(root, compareV2 ? "v3-v2-screenshot-hash-comparison.json" : "screenshot-hash-comparison.json"), JSON.stringify(comparison, null, 2));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(comparison).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, value.length]))));
}
