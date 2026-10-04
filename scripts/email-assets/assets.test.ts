import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const assetRoot = resolve(process.cwd(), "public/email");

describe("hosted email PNG assets", () => {
  it.each([
    ["logo", 358, 60],
    ["icon-check", 48, 48],
    ["icon-report", 48, 48],
    ["icon-bike", 48, 48],
    ["icon-plan", 48, 48],
    ["icon-tip", 48, 48],
    ["icon-gauge", 48, 48],
    ["measuring-kit", 960, 720],
    ["tyre", 960, 720],
    ["stack-reach", 960, 720],
  ])("%s uses the required PNG dimensions and image budget", async (name, width, height) => {
    const file = resolve(assetRoot, `${name}.png`);
    const bytes = await readFile(file);
    const metadata = await sharp(bytes).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(width);
    expect(metadata.height).toBe(height);
    expect((await stat(file)).size).toBeLessThan(300_000);
  });
});
