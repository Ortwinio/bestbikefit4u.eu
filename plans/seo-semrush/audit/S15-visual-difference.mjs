import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const old = await sharp("/private/tmp/S15-visual-review/after/S15-after-bikefitting-nl-390.png")
  .removeAlpha().raw().toBuffer({ resolveWithObject: true });
const current = await sharp("plans/seo-semrush/renders/S15-after-bikefitting-nl-390.png")
  .removeAlpha().raw().toBuffer({ resolveWithObject: true });
const previous = Buffer.alloc(current.data.length);
const changedRows = [];
let changedPixels = 0;
let maxChannelDelta = 0;
for (let row = 0; row < current.info.height; row++) {
  const strip = Math.floor(row / 1500);
  let changed = 0;
  for (let column = 0; column < 390; column++) {
    const oldOffset = ((Math.floor(strip / 4) * 1524 + 24 + row % 1500) * old.info.width
      + strip % 4 * 390 + column) * 3;
    const offset = (row * 390 + column) * 3;
    old.data.copy(previous, offset, oldOffset, oldOffset + 3);
    if ([0, 1, 2].some(channel => previous[offset + channel] !== current.data[offset + channel])) {
      changed++;
      for (const channel of [0, 1, 2]) {
        maxChannelDelta = Math.max(maxChannelDelta, Math.abs(previous[offset + channel] - current.data[offset + channel]));
      }
    }
  }
  if (changed) changedRows.push({ row, pixels: changed });
  changedPixels += changed;
}
const raw = { width: 390, height: current.info.height, channels: 3 };
for (const [label, top, height] of [["top", 440, 260], ["bottom", 4420, 300]]) {
  const before = await sharp(previous, { raw }).extract({ left: 0, top, width: 390, height }).png().toBuffer();
  const after = await sharp(current.data, { raw }).extract({ left: 0, top, width: 390, height }).png().toBuffer();
  await sharp({ create: { width: 780, height, channels: 3, background: "white" } })
    .composite([{ input: before, left: 0, top: 0 }, { input: after, left: 390, top: 0 }])
    .png().toFile(`plans/seo-semrush/renders/S15-S16-bikefitting-nl-390-${label}-comparison.png`);
}
await writeFile("plans/seo-semrush/audit/S15-visual-difference.json", JSON.stringify({
  layout: "pre-S16 left; final post-S16 right", changedPixels, maxChannelDelta, changedRows,
}, null, 2) + "\n");
console.log(JSON.stringify({ changedPixels, maxChannelDelta, rows: changedRows.length }));
