import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkPricingCopy } from "./check-pricing-copy.mjs";

const directories: string[] = [];
async function fixture(scope: string, copy: string) {
  const root = await mkdtemp(join(tmpdir(), "pricing-copy-"));
  directories.push(root);
  const path = join(root, scope);
  await mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  await writeFile(path, copy);
  return root;
}
afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("pricing copy guard", () => {
  it.each(["€24,50", "€24.50", "€19,50", "€19.50", "€5 korting", "€5 off", "annual_entry", "Pro monthly", "€9 / month"])(
    "rejects obsolete %s in published source", async (copy) => {
      expect(await checkPricingCopy(await fixture("src/i18n/pricing.ts", copy))).toHaveLength(1);
    },
  );
  it.each(["convex/emails/i18n/pricing.ts", "shared/pricing/products.ts"])("covers %s", async (scope) => {
    expect(await checkPricingCopy(await fixture(scope, "annual_entry"))).toHaveLength(1);
  });
  it("allows all current products and exact upgrade amounts", async () => {
    const copy = "€21,50 €21.50 €13,50 €13.50 €9,50 €9.50 €234,50 €234.50 €209,50 €209.50";
    expect(await checkPricingCopy(await fixture("src/i18n/pricing.ts", copy))).toEqual([]);
  });
  it("does not treat historical boards or negative regression assertions as live copy", async () => {
    expect(await checkPricingCopy(await fixture("plans/board.json", "€24,50"))).toEqual([]);
    expect(await checkPricingCopy(await fixture("src/copy.test.ts", "€24,50"))).toEqual([]);
  });
  it("keeps the current application, catalog and service mail copy clean", async () => {
    expect(await checkPricingCopy()).toEqual([]);
  });
});
