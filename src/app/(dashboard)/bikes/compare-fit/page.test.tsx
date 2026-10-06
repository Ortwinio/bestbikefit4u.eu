/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getBikesCopy } from "@/i18n/account/bikes";
import CompareBikeFitPage from "./page";

vi.mock("convex/react", () => ({ useQuery: () => undefined }));

let locale: "nl" | "en" = "en";

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale }),
}));

afterEach(cleanup);

describe("CompareBikeFitPage navigation", () => {
  it.each(["nl", "en"] as const)("links to the real bike garage in %s", (language) => {
    locale = language;
    render(<CompareBikeFitPage />);

    const link = screen.getByRole("link", { name: getBikesCopy(language).openGarage });
    expect(link.getAttribute("href")).toBe(`/${language}/bikes`);
    expect(document.querySelector('a[href*="/dashboard/bikes"]')).toBeNull();
  });
});
