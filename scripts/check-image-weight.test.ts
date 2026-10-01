import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { checkImageWeight } from "./check-image-weight.mjs";

it("checks raster/SVG budgets, rejects guide vectors, and only exempts named videos", async () => {
  const root = await mkdtemp(join(tmpdir(), "image-weight-test-"));
  try {
    await mkdir(`${root}/illustrations/guides`, { recursive: true });
    for (const [name, size] of [
      ["large.png", 300001], ["exact.webp", 300000], ["large.svg", 150001],
      ["illustrations/guides/source.svg", 12], ["new.mp4", 400000], ["bestbikefit4u-home.mp4", 400000],
    ] as const) await writeFile(`${root}/${name}`, Buffer.alloc(size));
    const result = await checkImageWeight(root);
    expect(result.failures).toHaveLength(4);
    expect(result.failures.join("\n")).toContain("large.png");
    expect(result.failures.join("\n")).toContain("large.svg");
    expect(result.failures.join("\n")).toContain("source.svg");
    expect(result.failures.join("\n")).toContain("new.mp4");
    expect(result.failures.join("\n")).not.toContain("exact.webp");
    expect(result.failures.join("\n")).not.toContain("bestbikefit4u-home.mp4");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
