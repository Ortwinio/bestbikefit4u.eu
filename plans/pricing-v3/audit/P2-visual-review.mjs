import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../renders/p2-visual");
const changedOnly = process.argv.includes("--changed-only");
const output = resolve(root, changedOnly ? "settings-dashboard-review-final-changed" : "settings-dashboard-review");
const baseline = changedOnly ? JSON.parse(await readFile(resolve(root, "initial-screenshot-hashes.json"), "utf8")) : null;
const results = JSON.parse(await readFile(resolve(root, "results.json"), "utf8"));
const owned = results.filter(entry => ["settings", "dashboard"].includes(entry.route));
if (owned.length !== 72 || owned.some(entry => !entry.captured)) throw new Error("72 owned captures required before review");
await mkdir(output, { recursive: true });
const groups = new Map();
const unchanged = [];
for (const entry of owned) {
  for (const suffix of entry.width === 390 ? ["", "-viewport"] : [""]) {
    const filename = `${entry.name}${suffix}.png`;
    const bytes = await readFile(resolve(root, filename));
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (baseline?.hashes[filename] === digest) { unchanged.push(filename); continue; }
    if (groups.has(digest)) { groups.get(digest).members.push(filename); continue; }
    const metadata = await sharp(bytes).metadata();
    groups.set(digest, { sha256: digest, representative: filename, members: [filename], width: metadata.width, height: metadata.height });
  }
}
const inventory = [...groups.values()];
const sheets = [];
for (let index = 0; index < inventory.length; index += 4) {
  const subset = inventory.slice(index, index + 4);
  const tiles = [];
  let top = 0;
  for (let row = 0; row < subset.length; row += 2) {
    let rowHeight = 0;
    for (let column = 0; column < 2 && row + column < subset.length; column++) {
      const entry = subset[row + column];
      const scaled = await sharp(resolve(root, entry.representative)).resize({ width: entry.width === 390 ? 390 : 720 }).png().toBuffer({ resolveWithObject: true });
      const label = Buffer.from(`<svg width="740" height="32"><rect width="740" height="32" fill="white"/><text x="8" y="21" font-family="sans-serif" font-size="13">${entry.representative}</text></svg>`);
      tiles.push({ input: label, left: column * 740, top });
      tiles.push({ input: scaled.data, left: column * 740, top: top + 32 });
      rowHeight = Math.max(rowHeight, scaled.info.height + 40);
    }
    top += rowHeight;
  }
  const filename = `sheet-${String(sheets.length + 1).padStart(2, "0")}.png`;
  await sharp({ create: { width: 1480, height: top, channels: 4, background: "white" } }).composite(tiles).png().toFile(resolve(output, filename));
  sheets.push({ filename, representatives: subset.map(entry => entry.representative) });
}
await writeFile(resolve(output, "inventory.json"), JSON.stringify({
  sourceCases: owned.length, sourcePngs: owned.reduce((count, entry) => count + (entry.width === 390 ? 2 : 1), 0),
  uniquePngs: inventory.length, groups: inventory, sheets, unchanged,
  method: "SHA256 byte-identical deduplication only. Sheets preserve full screenshot contents; 1440px images scaled to720, mobile kept390. Manual inspection recorded separately.",
}, null, 2));
console.log(JSON.stringify({ output, uniquePngs: inventory.length, sheets: sheets.length }));
