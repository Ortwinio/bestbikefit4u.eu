import { describe, expect, it } from "vitest";
import {
  HOME_QUOTES,
  HOME_QUOTES_BY_LOCALE,
  HOME_QUOTES_DISPLAY_COUNT,
  HOME_QUOTES_NL,
  selectRandomHomeQuotes,
  selectRandomHomeQuotesForLocale,
} from "./homeQuotes";

describe("home quotes selection", () => {
  it("returns display count by default", () => {
    const quotes = selectRandomHomeQuotes(HOME_QUOTES);
    expect(quotes).toHaveLength(HOME_QUOTES_DISPLAY_COUNT);
  });

  it("returns only unique values", () => {
    const quotes = selectRandomHomeQuotes(HOME_QUOTES);
    expect(new Set(quotes).size).toBe(quotes.length);
  });

  it("returns all quotes when requested count exceeds total", () => {
    const quotes = selectRandomHomeQuotes(
      HOME_QUOTES,
      HOME_QUOTES.length + 10
    );
    expect(quotes).toHaveLength(HOME_QUOTES.length);
    expect(new Set(quotes).size).toBe(HOME_QUOTES.length);
  });

  it("returns an empty list for non-positive counts", () => {
    expect(selectRandomHomeQuotes(HOME_QUOTES, 0)).toEqual([]);
    expect(selectRandomHomeQuotes(HOME_QUOTES, -3)).toEqual([]);
  });

  it("does not mutate the source quote list", () => {
    const before = [...HOME_QUOTES];
    void selectRandomHomeQuotes(HOME_QUOTES);
    expect(HOME_QUOTES).toEqual(before);
  });

  it("supports locale-specific quote pools", () => {
    const enQuotes = selectRandomHomeQuotesForLocale("en");
    const nlQuotes = selectRandomHomeQuotesForLocale("nl");

    expect(enQuotes.every((quote) => HOME_QUOTES_BY_LOCALE.en.includes(quote))).toBe(
      true
    );
    expect(nlQuotes.every((quote) => HOME_QUOTES_BY_LOCALE.nl.includes(quote))).toBe(
      true
    );
  });

  it("keeps dutch quote set distinct from english source", () => {
    expect(HOME_QUOTES_NL).toHaveLength(HOME_QUOTES.length);
    expect(HOME_QUOTES_NL[0]).not.toBe(HOME_QUOTES[0]);
  });

  it("produces varying sets across repeated selections", () => {
    const samples = Array.from({ length: 8 }, () =>
      selectRandomHomeQuotesForLocale("en").join("|")
    );

    expect(new Set(samples).size).toBeGreaterThan(1);
  });
});
