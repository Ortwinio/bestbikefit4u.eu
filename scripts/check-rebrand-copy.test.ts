import { expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findLegacyBrandCopy, hasDisallowedLegacyDomain, hasLegacyBrandCopy } from "./check-rebrand-copy.mjs";

it.each(["BestBikeFit4U", "bestbikefit4u", "Welcome to BestBikeFit4U",
  "BestBikeFit4U <support@bestbikefit4u.eu>", "BestBikeFit4U — https://bestbikefit4u.eu"])(
  "rejects legacy visible copy including old addresses: %s", (value) => {
    expect(hasLegacyBrandCopy(value)).toBe(true);
  },
);

it.each(["BikeFitBoost", "support@bikefitboost.com", "https://bikefitboost.com/nl",
  "noreply@notifications.bikefitboost.com", "/bestbikefit4u-home.mp4"])(
  "allows current addresses and retained media identifiers: %s", (value) => {
    expect(hasLegacyBrandCopy(value)).toBe(false);
  },
);

it.each(["support@bestbikefit4u.eu", "https://www.bestbikefit4u.eu/nl",
  "noreply@notifications.bestbikefit4u.eu", "bestbikefit4u.eu"])(
  "does not globally exempt old email addresses or hosts: %s", (value) => {
    expect(hasLegacyBrandCopy(value)).toBe(true);
    expect(hasDisallowedLegacyDomain(value, "src/new-page.tsx")).toBe(true);
    expect(hasDisallowedLegacyDomain(value, "src/new-page.test.tsx")).toBe(true);
  },
);

it("limits exemptions to explicit legacy constants and backward-compatibility fixtures", () => {
  expect(hasDisallowedLegacyDomain("bestbikefit4u.eu", "shared/brand.ts")).toBe(false);
  expect(hasDisallowedLegacyDomain("support@bestbikefit4u.eu", "shared/brand.ts")).toBe(true);
  expect(hasDisallowedLegacyDomain("https://bestbikefit4u.eu/og/example.jpg", "src/lib/seo/social-image.test.ts"))
    .toBe(false);
  expect(hasDisallowedLegacyDomain("https://bestbikefit4u.eu", "src/other/social-image.test.ts")).toBe(true);
  expect(hasDisallowedLegacyDomain("bestbikefit4u\\.eu", "src/new-regex.ts")).toBe(true);
  expect(hasDisallowedLegacyDomain("https://bestbikefit4u.eu", "convex/migrations/domainMigration.ts"))
    .toBe(false);
  expect(hasDisallowedLegacyDomain("support@bestbikefit4u.eu", "convex/migrations/domainMigration.ts"))
    .toBe(true);
  expect(hasDisallowedLegacyDomain("https://bestbikefit4u.eu", "convex/migrations/unrelated.ts"))
    .toBe(true);
  expect(hasDisallowedLegacyDomain("https://bestbikefit4u.eu", "scripts/domain-migration-check.test.ts"))
    .toBe(false);
  expect(hasDisallowedLegacyDomain("https://bestbikefit4u.eu", "scripts/domain-migration-check.test.mjs"))
    .toBe(true);
});

it("scans new tests, scripts and runtime source without a blanket test exemption", async () => {
  const root = await mkdtemp(join(tmpdir(), "domain-guard-"));
  try {
    await Promise.all(["src", "scripts"].map((directory) => mkdir(join(root, directory))));
    await writeFile(join(root, "src", "page.test.ts"), 'const contact = "support@bestbikefit4u.eu";');
    await writeFile(join(root, "src", "page.tsx"), 'const link = "https://bestbikefit4u.eu";');
    await writeFile(join(root, "scripts", "check.mjs"), 'const host = "bestbikefit4u.eu";');
    expect((await findLegacyBrandCopy(root)).map(({ file }) => file).sort())
      .toEqual(["scripts/check.mjs", "src/page.test.ts", "src/page.tsx"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("contains no legacy brand in UI, i18n, metadata, backend email or CMS import copy", async () => {
  expect(await findLegacyBrandCopy()).toEqual([]);
});
