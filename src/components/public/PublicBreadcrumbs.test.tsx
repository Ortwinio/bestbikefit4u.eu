import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicBreadcrumbs } from "./PublicBreadcrumbs";

describe("public breadcrumb language", () => {
  it.each([["nl", "Kruimelpad"], ["en", "Breadcrumb"]])("follows the %s home link", (locale, label) => {
    const html = renderToStaticMarkup(<PublicBreadcrumbs items={[
      { label: "Home", href: `/${locale}` }, { label: "Gidsen" },
    ]} />);
    expect(html).toContain(`aria-label="${label}"`);
    expect(html).toContain("data-breadcrumb");
    expect(html).toContain("min-h-11 min-w-11");
  });
});
