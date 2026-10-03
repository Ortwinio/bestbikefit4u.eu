/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandLogo } from "./BrandLogo";

vi.mock("@/components/providers/ThemeProvider", () => ({ useTheme: () => ({ resolvedTheme: "dark" }) }));
afterEach(cleanup);

describe("brand logo alternatives", () => {
  it("names the image and linked destination only once", () => {
    render(<BrandLogo href="/nl" />);
    expect(screen.getByRole("img", { name: "BestBikeFit4U" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "BestBikeFit4U" }).hasAttribute("aria-label")).toBe(false);
  });
  it("retains brand alternative for an unlinked mark", () => {
    render(<BrandLogo asset="mark" />);
    expect(screen.getByRole("img", { name: "BestBikeFit4U" })).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
