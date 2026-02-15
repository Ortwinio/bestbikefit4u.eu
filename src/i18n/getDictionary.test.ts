import { describe, expect, it, vi } from "vitest";

// `getDictionary` is server-only by design; tests run in Node and mock this marker module.
vi.mock("server-only", () => ({}));

import { getDictionary, getDictionaryForLocale } from "./getDictionary";

describe("dictionary loading", () => {
  it("loads english dictionary", async () => {
    const dictionary = await getDictionary("en");
    expect(dictionary.nav.pricing).toBe("Pricing");
    expect(dictionary.common.language).toBe("Language");
  });

  it("loads dutch dictionary", async () => {
    const dictionary = await getDictionary("nl");
    expect(dictionary.nav.pricing).toBe("Prijzen");
    expect(dictionary.common.language).toBe("Taal");
  });

  it("falls back to english for unsupported locale", async () => {
    const dictionary = await getDictionaryForLocale("de");
    expect(dictionary.nav.pricing).toBe("Pricing");
  });

  it("falls back to english for empty locale", async () => {
    const dictionary = await getDictionaryForLocale(undefined);
    expect(dictionary.nav.pricing).toBe("Pricing");
  });
});
