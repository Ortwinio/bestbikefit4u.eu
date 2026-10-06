import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BikeAccessNotice } from "./BikeAccessNotice";
describe("locked bike creation heading", () => {
  it.each(["nl", "en"] as const)("provides one page heading only on the blocked creation page in %s", locale => {
    expect(renderToStaticMarkup(<BikeAccessNotice locale={locale} pageHeading />).match(/<h1\b/g)).toHaveLength(1);
    expect(renderToStaticMarkup(<BikeAccessNotice locale={locale} />)).not.toContain("<h1");
  });
});
