/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CrankLengthCalculatorPage from "./page";

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
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/calculators/crank-length` }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./CrankLengthCalculatorForm", () => ({
  CrankLengthCalculatorForm: () => <div>Crank Form</div>,
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("crank length page", () => {
  it("keeps the calculator value-first next-step CTAs in English", async () => {
    const ui = await CrankLengthCalculatorPage({
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByText("Crank Length Calculator")).toBeTruthy();
    expect(screen.getByText("Crank Form")).toBeTruthy();
    expect(screen.getByText("Create account or sign in").closest("a")?.getAttribute("href")).toBe(
      "/en/login"
    );
    expect(screen.getByText("Compare Free vs Pro").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.getByText("Open bike-fit calculator").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
  });
});
