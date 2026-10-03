import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbListSchema,
  buildCalculatorPageSchemas,
  buildPersonSchema, buildOrganizationSchema, buildArticleSchema,
  buildFaqPageSchema,
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

  it.each(["nl", "en"] as const)("builds calculator WebPage and canonical breadcrumbs in %s", (locale) => {
    const url = `https://bestbikefit4u.eu/${locale}/calculators/saddle-height`;
    const schemas = buildCalculatorPageSchemas({
      name: "Saddle height",
      description: "Calculate your saddle height.",
      url,
      locale,
    });

    expect(schemas).toEqual([
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Saddle height",
        description: "Calculate your saddle height.",
        url,
        inLanguage: locale,
      },
      buildBreadcrumbListSchema([
        { name: "Home", item: `https://bestbikefit4u.eu/${locale}` },
        { name: "Saddle height", item: url },
      ]),
    ]);
    expect(JSON.stringify(schemas)).not.toMatch(/SoftwareApplication|WebApplication|aggregateRating/);
  });

  it("can preserve an existing calculator breadcrumb without adding another", () => {
    const schemas = buildCalculatorPageSchemas({
      name: "Bike fit",
      description: "Calculate your bike fit.",
      url: "https://bestbikefit4u.eu/en/calculators/bike-fit",
      locale: "en",
      breadcrumb: false,
    });

    expect(schemas).toHaveLength(1);
    expect(schemas[0]?.["@type"]).toBe("WebPage");
  });
});


describe("confirmed author identity", () => {
  it.each(["nl", "en"] as const)("links the real author page in %s without invented profiles", locale => {
    const person = buildPersonSchema(locale);
    expect(person).toMatchObject({ "@type": "Person", name: "Ortwin Verreck", sameAs: [],
      url: `https://bestbikefit4u.eu/${locale}/authors/ortwin-verreck` });
    expect(person).not.toHaveProperty("jobTitle");
    expect(person).not.toHaveProperty("description");
    const organization = buildOrganizationSchema();
    expect(organization).toMatchObject({ name: "BestBikeFit4U", url: "https://bestbikefit4u.eu", sameAs: [],
      logo: "https://bestbikefit4u.eu/brand/logo/logo-horizontaal.svg" });
    const article = buildArticleSchema({ headline: "Guide", description: "Guide content",
      url: "https://bestbikefit4u.eu/en/guides/example", author: person, dateModified: "2026-10-01" });
    expect(article.author).toEqual(person);
    expect(article.dateModified).toBe("2026-10-01");
    expect(article).not.toHaveProperty("reviewedBy");
    expect(article).not.toHaveProperty("lastReviewed");
    expect(buildArticleSchema({ headline: "Guide", description: "Guide content", url: "https://example.com" }))
      .not.toHaveProperty("dateModified");
  });
});
