import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { AccessibleDialog } from "./accessible-dialog";
import { HOME_CLOSING_CTA_CONTENT } from "@/components/home/homeRedesignContent";
import nl from "@/i18n/messages/nl";

const context = vi.hoisted(() => ({ path: "/nl/test" }));
vi.mock("next/navigation", () => ({ usePathname: () => context.path }));
it.each([["nl", "Dialoog sluiten"], ["en", "Close dialog"]])("localizes SSR dialog in %s", (locale, label) => {
  context.path = `/${locale}/test`;
  const html = renderToStaticMarkup(<AccessibleDialog open title="Test" onClose={() => {}}>Content</AccessibleDialog>);
  expect(html).toContain(`aria-label="${label}"`);
  expect(html).toContain(`>${label}</span>`);
});
it("uses Dutch comparison wording in both home sources", () => {
  expect(HOME_CLOSING_CTA_CONTENT.nl.pricingLabel).toBe("Vergelijk Free en Pro");
  expect(JSON.stringify(nl)).toContain("Vergelijk Free en Pro");
  expect(JSON.stringify(nl)).not.toContain("Vergelijk Free vs Pro");
  expect(HOME_CLOSING_CTA_CONTENT.en.pricingLabel).toBe("Compare Free vs Pro");
});
