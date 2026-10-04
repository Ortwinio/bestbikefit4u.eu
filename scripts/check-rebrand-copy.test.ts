import { expect, it } from "vitest";
import { findLegacyBrandCopy, hasLegacyBrandCopy } from "./check-rebrand-copy.mjs";

it.each(["BestBikeFit4U", "bestbikefit4u", "Welcome to BestBikeFit4U",
  "BestBikeFit4U <support@bestbikefit4u.eu>", "BestBikeFit4U — https://bestbikefit4u.eu"])(
  "rejects legacy visible copy even next to allowed addresses: %s", (value) => {
    expect(hasLegacyBrandCopy(value)).toBe(true);
  },
);

it.each(["BikeFitBoost", "support@bestbikefit4u.eu", "https://www.bestbikefit4u.eu/nl",
  "noreply@notifications.bestbikefit4u.eu", "/bestbikefit4u-home.mp4"])(
  "allows retained routing/email/media identifiers: %s", (value) => {
    expect(hasLegacyBrandCopy(value)).toBe(false);
  },
);

it("contains no legacy brand in UI, i18n, metadata, backend email or CMS import copy", async () => {
  expect(await findLegacyBrandCopy()).toEqual([]);
});
