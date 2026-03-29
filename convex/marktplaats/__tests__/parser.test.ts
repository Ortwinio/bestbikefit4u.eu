import { describe, expect, it } from "vitest";
import {
  isSupportedMarktplaatsHost,
  normalizeMarktplaatsUrl,
  parseMarktplaatsAdvert,
} from "../parser";

const ttHtml = `
  <html>
    <head>
      <title>Ridley Dean tijdritfiets maat S Di2 11 speed</title>
      <link rel="canonical" href="https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m2374438721-ridley-dean-tijdritfiets-maat-s-di2-11-speed" />
      <meta property="og:title" content="Ridley Dean tijdritfiets maat S Di2 11 speed" />
      <meta property="og:description" content="Nette tijdritfiets met carbon frame en Shimano Di2." />
      <meta property="og:image" content="https://images.marktplaats.nl/api/v1/listing/a.jpg" />
    </head>
  </html>
`;

const gravelHtml = `
  <html>
    <head>
      <meta property="og:description" content="Korte samenvatting voor social sharing." />
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Canyon Grail gravelbike maat M",
          "description": "Gravelbike in goede staat met veel extra's, extra wielset en complete onderhoudshistorie voor lange ritten.",
          "image": ["//images.marktplaats.nl/api/v1/listing/g1.jpg", {"contentUrl": "//images.marktplaats.nl/api/v1/listing/g2.jpg"}]
        }
      </script>
    </head>
  </html>
`;

const richListingHtml = `
  <html>
    <head>
      <title>Specialized Tarmac maat 56 Ultegra Di2</title>
      <meta property="og:title" content="Specialized Tarmac maat 56 Ultegra Di2" />
      <meta property="og:image" content="//images.marktplaats.nl/api/v1/listing/tarmac-main.jpg" />
    </head>
    <body>
      <div data-testid="description">
        Zeer nette racefiets in uitstekende staat. Maat 56 met Shimano Ultegra Di2, carbon frame en extra wielset.
        Altijd dealer onderhouden, onlangs servicebeurt gehad met nieuwe ketting en nieuwe banden.
        Enkele lichte gebruikssporen maar technisch helemaal in orde voor lange ritten of wedstrijden.
      </div>
    </body>
  </html>
`;

describe("marktplaats parser", () => {
  it("validates supported hosts", () => {
    expect(isSupportedMarktplaatsHost("www.marktplaats.nl")).toBe(true);
    expect(isSupportedMarktplaatsHost("images.marktplaats.nl")).toBe(true);
    expect(isSupportedMarktplaatsHost("example.com")).toBe(false);
  });

  it("normalizes supported urls", () => {
    expect(
      normalizeMarktplaatsUrl(
        "https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m1-test#anchor"
      )
    ).toBe("https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m1-test");
  });

  it("extracts a high-confidence tt advert", () => {
    const result = parseMarktplaatsAdvert({
      sourceUrl:
        "https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m2374438721-ridley-dean-tijdritfiets-maat-s-di2-11-speed",
      html: ttHtml,
    });

    expect(result.advertTitle).toContain("Ridley Dean");
    expect(result.candidateBrand.value).toBe("Ridley");
    expect(result.candidateBikeType.value).toBe("tt_triathlon");
    expect(result.candidateBikeType.confidence).toBe("high");
    expect(result.imageUrls).toHaveLength(1);
  });

  it("extracts json-ld content", () => {
    const result = parseMarktplaatsAdvert({
      sourceUrl:
        "https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m2374438721-canyon-grail",
      html: gravelHtml,
    });

    expect(result.advertTitle).toBe("Canyon Grail gravelbike maat M");
    expect(result.description).toContain("complete onderhoudshistorie");
    expect(result.candidateBrand.value).toBe("Canyon");
    expect(result.candidateBikeType.value).toBe("gravel");
    expect(result.imageUrls).toHaveLength(2);
    expect(result.imageUrls[0]).toBe("https://images.marktplaats.nl/api/v1/listing/g1.jpg");
  });

  it("preserves long advert text and extracts deterministic preview signals", () => {
    const result = parseMarktplaatsAdvert({
      sourceUrl:
        "https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m9999999999-specialized-tarmac",
      html: richListingHtml,
    });

    expect(result.description).toContain("dealer onderhouden");
    expect(result.rawDescription).toContain("nieuwe ketting");
    expect(result.imageUrls[0]).toBe(
      "https://images.marktplaats.nl/api/v1/listing/tarmac-main.jpg"
    );
    expect(result.derivedSignals.sizeMentions).toContain("maat 56");
    expect(result.derivedSignals.componentMentions).toEqual(
      expect.arrayContaining(["Shimano Ultegra", "Shimano Di2", "Carbon frame", "Wheelset included"])
    );
    expect(result.derivedSignals.conditionMentions).toEqual(
      expect.arrayContaining(["Very good condition", "Used bike"])
    );
    expect(result.derivedSignals.maintenanceMentions).toEqual(
      expect.arrayContaining(["Recently serviced", "New chain", "New tires"])
    );
    expect(result.derivedSignals.previewWarnings).not.toContain("limited_description");
    expect(result.derivedSignals.previewWarnings).not.toContain("no_size_mention_found");
  });
});
