import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const audit = resolve("plans/seo-semrush/audit");
const renders = resolve("plans/seo-semrush/renders");
const phase = process.argv[2];
if (!["before", "after", "checkpoint"].includes(phase)) throw new Error("Expected before, after or checkpoint");
const capture = JSON.parse(await readFile(resolve(audit, `S15-visual-${phase === "checkpoint" ? "after" : phase}.json`), "utf8"));
if (phase === "checkpoint") {
  const records = [];
  for (const row of capture.results) {
    const screenshot = await readFile(resolve(renders, row.screenshot));
    records.push({ ...row, screenshotSha256: createHash("sha256").update(screenshot).digest("hex") });
  }
  await writeFile(resolve(audit, "S15-visual-preS16.json"), JSON.stringify({ ...capture, results: records }, null, 2) + "\n", { flag: "wx" });
  console.log(`Preserved ${records.length} pre-S16 records and screenshot hashes`);
} else {
  const output = `/private/tmp/S15-visual-review/${phase}`;
  await mkdir(output, { recursive: true });
  for (const row of capture.results) {
    const width = row.width === 390 ? 390 : 720;
    const columns = row.width === 390 ? 4 : 2;
    const stripHeight = 1500;
    const buffer = await sharp(resolve(renders, row.screenshot)).resize({ width }).toBuffer();
    const metadata = await sharp(buffer).metadata();
    const count = Math.ceil(metadata.height / stripHeight);
    const tiles = [];
    for (let index = 0; index < count; index++) {
      const top = index * stripHeight;
      const height = Math.min(stripHeight, metadata.height - top);
      const title = Buffer.from(`<svg width="${width}" height="24"><rect width="100%" height="100%" fill="white"/><text x="8" y="18" font-size="14">${row.id} ${row.locale} ${row.width} strip ${index + 1}/${count}</text></svg>`);
      const image = await sharp(buffer).extract({ left: 0, top, width, height }).toBuffer();
      const left = index % columns * width;
      const sheetTop = Math.floor(index / columns) * (stripHeight + 24);
      tiles.push({ input: title, left, top: sheetTop }, { input: image, left, top: sheetTop + 24 });
    }
    await sharp({ create: { width: Math.min(count, columns) * width, height: Math.ceil(count / columns) * (stripHeight + 24), channels: 3, background: "#ffffff" } })
      .composite(tiles).png().toFile(resolve(output, row.screenshot));
  }
  console.log(`Prepared ${capture.results.length} complete-page strip sheets in ${output}`);
}
