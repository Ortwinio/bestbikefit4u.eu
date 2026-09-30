/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShoeCleatFitPage from "./page";
import { toolsCleatMessages } from "@/i18n/account/toolsCleat";
let locale: "nl" | "en" = "en";
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale }) }));
afterEach(cleanup);
describe("ShoeCleatFitPage", () => {
  it.each(["nl", "en"] as const)("renders honest guidance and the real fit route in %s", (language) => {
    locale = language;
    const copy = toolsCleatMessages[language];
    render(<ShoeCleatFitPage />);
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeTruthy();
    expect(screen.getByRole("region", { name: copy.order })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(copy.helpBody)).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.action }).getAttribute("href")).toBe(`/${language}/fit`);
    expect(screen.queryByText(/Voorbeeldgegevens/)).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
