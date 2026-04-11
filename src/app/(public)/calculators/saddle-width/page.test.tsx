/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SaddleWidthCalculatorPage from "./page";

let locale: "en" | "nl" = "en";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href,
    children,
  }: {
    href: string;
    children?: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/campaign/CampaignCtaGroup", () => ({
  CampaignCtaGroup: () => <div>Campaign CTA</div>,
}));

vi.mock("@/config/commercial", async () => {
  const actual = await vi.importActual<object>("@/config/commercial");
  return {
    ...actual,
    isConsumerCampaignActive: () => false,
    getConsumerCampaignCopy: () => ({ donateCta: "Donate" }),
  };
});

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({
    canonical: `https://bestbikefit4u.eu/${locale}/calculators/saddle-width`,
  }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildHowToSchema: () => ({}),
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./SaddleWidthCalculatorForm", () => ({
  SaddleWidthCalculatorForm: () => <div>Saddle width form</div>,
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("saddle width calculator page", () => {
  it("renders the public saddle-width flow in English", async () => {
    const ui = await SaddleWidthCalculatorPage();
    render(ui);

    expect(screen.getByText("Saddle Width Calculator")).toBeTruthy();
    expect(screen.getByText("Saddle width form")).toBeTruthy();
    expect(screen.getByText("Open bike-fit calculator").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.getByText("Create account or sign in").closest("a")?.getAttribute("href")).toBe(
      "/en/login"
    );
  });
});
