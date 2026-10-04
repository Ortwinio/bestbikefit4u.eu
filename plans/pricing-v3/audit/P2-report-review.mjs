import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = "/Users/ortwinverreck/Developer/bestbikefit4u-pricing";
const source = resolve(root, "plans/pricing-v3/renders/p2-visual");
const output = "/private/tmp/P2-report-review";
await mkdir(output, { recursive: true });
const results = JSON.parse(await readFile(resolve(source, "results.json"), "utf8"));
const reportCases = results.filter(entry => entry.id.startsWith("results-") && entry.captured);
if (reportCases.length !== 48) throw new Error(`Expected 48 captured report cases, got ${reportCases.length}`);
const groups = new Map();
for (const result of reportCases) {
  const bytes = await readFile(resolve(source, result.screenshot));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (groups.has(hash)) {
    groups.get(hash).cases.push(result.name);
    continue;
  }
  const metadata = await sharp(bytes).metadata();
  const width = Math.min(metadata.width, 720);
  const resized = await sharp(bytes).resize({ width }).png().toBuffer();
  const height = (await sharp(resized).metadata()).height;
  const stripHeight = 1300;
  const count = Math.ceil(height / stripHeight);
  const columns = Math.min(count, result.width === 390 ? 4 : 2);
  const composites = [];
  for (let index = 0; index < count; index++) {
    const top = index * stripHeight;
    const strip = await sharp(resized).extract({ left: 0, top, width, height: Math.min(stripHeight, height - top) })
      .png().toBuffer();
    composites.push({ input: strip, left: (index % columns) * (width + 12), top: Math.floor(index / columns) * (stripHeight + 12) });
  }
  const sheet = resolve(output, `${result.name}.png`);
  await sharp({ create: { width: columns * (width + 12), height: Math.ceil(count / columns) * (stripHeight + 12),
    channels: 3, background: "white" } }).composite(composites).png().toFile(sheet);
  groups.set(hash, { hash, cases: [result.name], source: result.screenshot, sheet, count });
}
const manifest = [...groups.values()];
await writeFile(resolve(output, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ uniqueImages: manifest.length, cases: manifest.reduce((sum, group) => sum + group.cases.length, 0), output }));
