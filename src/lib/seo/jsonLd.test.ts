import { describe, expect, it } from "vitest";
import { buildBreadcrumbListSchema, buildFaqPageSchema } from "./jsonLd";

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
});
