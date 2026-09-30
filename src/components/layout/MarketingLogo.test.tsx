/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BRAND } from "@/config/brand";
import { MarketingLogo } from "./MarketingLogo";

afterEach(cleanup);

describe("marketing logo theme", () => {
  it("keeps a 44px hit area when a caller requests block display", () => {
    render(<MarketingLogo href="/nl" className="block w-[200px]" />);
    const classes = screen.getByRole("link", { name: BRAND.name }).className.split(" ");
    expect(classes).toContain("min-h-11");
    expect(classes).toContain("min-w-11");
    expect(classes).toContain("flex");
    expect(classes).not.toContain("block");
  });

  it("provides both theme assets without depending on client hydration", () => {
    const { container } = render(<MarketingLogo href="/nl" />);
    const images = container.querySelectorAll("img");
    expect(images[0].getAttribute("src")).toBe(BRAND.assets.logoPrimary);
    expect(images[0].className).toContain("dark:hidden");
    expect(images[1].getAttribute("src")).toBe(BRAND.assets.logoDark);
    expect(images[1].className).toContain("dark:block");
    expect(images[1].className.split(" ")).toContain("hidden");
    expect(screen.getByRole("link", { name: BRAND.name }).getAttribute("href")).toBe("/nl");
  });

  it("exposes one accessible home link with the caller's label", () => {
    const { container } = render(<MarketingLogo href="/en" ariaLabel="Home" />);
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/en");
    expect([...container.querySelectorAll("img")].every((image) => image.alt === "")).toBe(true);
  });
});
