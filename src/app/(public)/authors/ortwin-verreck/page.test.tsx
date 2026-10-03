/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AuthorPage, { generateMetadata } from "./page";
import { AUTHORSHIP } from "@/config/authorship";

let locale: "nl" | "en" = "nl";
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("server-only", () => ({}));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object }) => <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />,
}));
afterEach(cleanup);

describe("confirmed author page", () => {
  it.each(["nl", "en"] as const)("shows only the confirmed name and site in %s", async language => {
    locale = language;
    const { container } = render(await AuthorPage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(AUTHORSHIP.name);
    expect(screen.getByRole("link", { name: "BestBikeFit4U" }).getAttribute("href")).toBe(`/${locale}`);
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema).toMatchObject({ "@type": "Person", name: "Ortwin Verreck", sameAs: [],
      url: `https://bestbikefit4u.eu/${locale}/authors/ortwin-verreck` });
    for (const unsupported of ["jobTitle", "description", "award", "hasCredential", "reviewedBy"]) {
      expect(schema).not.toHaveProperty(unsupported);
    }
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe(schema.url);
    expect(metadata.title).toBe("Ortwin Verreck | BestBikeFit4U");
    expect(metadata.alternates?.languages).toMatchObject({
      nl: "https://bestbikefit4u.eu/nl/authors/ortwin-verreck",
      en: "https://bestbikefit4u.eu/en/authors/ortwin-verreck",
    });
    expect(metadata.openGraph).toMatchObject({ url: schema.url, type: "profile" });
  });
});
