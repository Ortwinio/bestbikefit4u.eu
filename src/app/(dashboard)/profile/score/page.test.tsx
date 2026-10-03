import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Page, { generateMetadata } from "./page";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { BIKE_RULES, RIDER_RULES } from "../../../../../shared/profileScore";

const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en" }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => state.locale }));

it.each(["nl", "en"] as const)("renders the %s explainer and noindex metadata", async locale => {
  state.locale = locale;
  const copy = getProfileScoreCopy(locale);
  const html = renderToStaticMarkup(await Page());
  expect(html).toContain(copy.pageTitle);
  expect(html).toContain(copy.disclaimer);
  expect(html).toContain(copy.formula);
  expect(html).toContain(`/${locale}/profile`);
  for (const rule of [...RIDER_RULES, ...BIKE_RULES]) {
    expect(copy.fields[rule.key]).toBeTruthy();
  }
  const metadata = await generateMetadata();
  expect(metadata).toMatchObject({ title: copy.pageTitle, description: copy.description, robots: { index: false, follow: false } });
  expect(metadata.alternates?.languages).toBeUndefined();
});
