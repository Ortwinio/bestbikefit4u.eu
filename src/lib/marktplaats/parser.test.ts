import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  fetchMarktplaatsAdvert,
  normalizeMarktplaatsUrl,
  parseMarktplaatsAdvertHtml,
} from "./parser";

function loadFixture(name: string): string {
  const currentDir = fileURLToPath(new URL(".", import.meta.url));
  return readFileSync(resolve(currentDir, "__fixtures__", name), "utf8");
}

describe("normalizeMarktplaatsUrl", () => {
  it("accepts secure canonical advert URLs only", () => {
    expect(
      normalizeMarktplaatsUrl(
        "https://www.marktplaats.nl/v/fietsen-en-brommers/racefietsen/m123-demo"
      )
    ).toBe(
      "https://www.marktplaats.nl/v/fietsen-en-brommers/racefietsen/m123-demo"
    );
    expect(normalizeMarktplaatsUrl("http://www.marktplaats.nl/v/demo")).toBeNull();
    expect(normalizeMarktplaatsUrl("https://example.com/v/demo")).toBeNull();
    expect(normalizeMarktplaatsUrl("https://www.marktplaats.nl/help")).toBeNull();
  });
});

describe("parseMarktplaatsAdvertHtml", () => {
  it("parses a clear road-bike advert from structured data", () => {
    const result = parseMarktplaatsAdvertHtml(
      "https://www.marktplaats.nl/v/fietsen-en-brommers/racefietsen/m1234567890-canyon-endurace-cf-7-racefiets-maat-m",
      loadFixture("clear-road-bike.html")
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.advert.advertTitle).toBe("Canyon Endurace CF 7 racefiets");
    expect(result.advert.candidateBrand).toMatchObject({
      value: "Canyon",
      confidence: "high",
      source: "structured_data",
      needsReview: false,
    });
    expect(result.advert.candidateModel).toMatchObject({
      value: "Endurace CF 7",
      confidence: "high",
      source: "structured_data",
    });
    expect(result.advert.candidateBikeType).toMatchObject({
      value: "road",
      confidence: "high",
      source: "structured_data",
    });
    expect(result.advert.imageUrls).toHaveLength(2);
  });

  it("derives a clear TT advert conservatively when only title keywords are stable", () => {
    const result = parseMarktplaatsAdvertHtml(
      "https://www.marktplaats.nl/v/fietsen-en-brommers/racefietsen/m2234567890-cervelo-p-series-tijdritfiets",
      loadFixture("clear-tt-bike.html")
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.advert.candidateBrand).toMatchObject({
      value: "Cervelo",
      confidence: "high",
      source: "title_normalization",
    });
    expect(result.advert.candidateModel).toMatchObject({
      value: "P-Series",
      confidence: "medium",
      needsReview: true,
    });
    expect(result.advert.candidateBikeType).toMatchObject({
      value: "tt_triathlon",
      confidence: "high",
    });
  });

  it("keeps weak noisy adverts review-heavy instead of guessing", () => {
    const result = parseMarktplaatsAdvertHtml(
      "https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m3234567890-zgan-carbon-fiets",
      loadFixture("noisy-weak-advert.html")
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.advert.candidateBrand.value).toBeNull();
    expect(result.advert.candidateBrand.confidence).toBe("none");
    expect(result.advert.candidateModel.value).toBeNull();
    expect(result.advert.candidateBikeType).toMatchObject({
      value: null,
      confidence: "low",
      needsReview: true,
    });
  });

  it("fails safely on malformed non-advert pages", () => {
    const result = parseMarktplaatsAdvertHtml(
      "https://www.marktplaats.nl/v/fietsen-en-brommers/racefietsen/m4234567890-help",
      loadFixture("malformed-page.html")
    );

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "not_an_advert",
      },
    });
  });
});

describe("fetchMarktplaatsAdvert", () => {
  it("rejects unsupported URLs before fetching", async () => {
    const result = await fetchMarktplaatsAdvert("https://example.com/bike");

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "unsupported_url",
      },
    });
  });
});
