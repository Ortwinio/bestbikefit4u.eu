/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandLogo } from "./BrandLogo";

vi.mock("@/components/providers/ThemeProvider", () => ({ useTheme: () => ({ resolvedTheme: "dark" }) }));
afterEach(cleanup);

describe("brand logo alternatives", () => {
  it("names the image and linked destination only once", () => {
    render(<BrandLogo href="/nl" />);
    expect(screen.getByRole("img", { name: "BikeFitBoost" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "BikeFitBoost" }).hasAttribute("aria-label")).toBe(false);
  });
  it("retains brand alternative for an unlinked mark", () => {
    render(<BrandLogo asset="mark" />);
    expect(screen.getByRole("img", { name: "BikeFitBoost" })).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("uses the negative stacked asset on a dark login surface", () => {
    render(<BrandLogo asset="stacked" />);
    expect(screen.getByRole("img").getAttribute("src")).toContain("logo-gestapeld-negatief.svg");
    expect(screen.getByRole("img").getAttribute("width")).toBe("344");
    expect(screen.getByRole("img").getAttribute("height")).toBe("174");
  });
});
