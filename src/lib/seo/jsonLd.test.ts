import { describe, expect, it } from "vitest";
import {
  CALCULATOR_AGGREGATE_RATING,
  buildBreadcrumbListSchema,
  buildFaqPageSchema,
  buildWebApplicationSchema,
} from "./jsonLd";

describe("seo jsonLd helpers", () => {
  it("builds FAQPage schema from visible FAQs", () => {
    const schema = buildFaqPageSchema([
      { q: "Question?", a: "Answer." },
    ]);

    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0]?.name).toBe("Question?");
    expect(schema.mainEntity[0]?.acceptedAnswer?.text).toBe("Answer.");
  });

  it("builds breadcrumb schema with ordered items", () => {
    const schema = buildBreadcrumbListSchema([
      { name: "Home", item: "https://bestbikefit4u.eu/en" },
      { name: "Guides", item: "https://bestbikefit4u.eu/en/guides" },
    ]);

    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement[0]?.position).toBe(1);
    expect(schema.itemListElement[1]?.name).toBe("Guides");
  });

  it("adds aggregate rating data to calculator web application schema", () => {
    const schema = buildWebApplicationSchema({
      name: "BestBikeFit4U Bike Fit Calculator",
      description: "Free bike-fit calculator.",
      url: "https://bestbikefit4u.eu/en/calculators/bike-fit",
      aggregateRating: CALCULATOR_AGGREGATE_RATING,
    });

    expect(schema).toMatchObject({
      "@type": "WebApplication",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: 380,
        bestRating: "5",
        worstRating: "1",
      },
    });
  });
});
