/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BRAND } from "@/config/brand";
import { MarketingLogo } from "./MarketingLogo";

afterEach(cleanup);

function renderLogo(props: React.ComponentProps<typeof MarketingLogo>) {
  return render(<><style>{".hidden { display: none; }"}</style><MarketingLogo {...props} /></>);
}

describe("marketing logo theme", () => {
  it("keeps a 44px hit area when a caller requests block display", () => {
    renderLogo({ href: "/nl", className: "block w-[200px]" });
    const classes = screen.getByRole("link", { name: BRAND.name }).className.split(" ");
    expect(classes).toContain("min-h-11");
    expect(classes).toContain("min-w-11");
    expect(classes).toContain("flex");
    expect(classes).not.toContain("block");
  });

  it("provides both theme assets without depending on client hydration", () => {
    const { container } = renderLogo({ href: "/nl" });
    const images = container.querySelectorAll("img");
    expect(images[0].getAttribute("src")).toBe(BRAND.assets.logoPrimary);
    expect(images[0].className).toContain("dark:hidden");
    expect(images[1].getAttribute("src")).toBe(BRAND.assets.logoDark);
    expect(images[1].className).toContain("dark:block");
    expect(images[1].className.split(" ")).toContain("hidden");
    expect(screen.getByRole("link", { name: BRAND.name }).getAttribute("href")).toBe("/nl");
  });

  it("uses the brand image alternative without a duplicate link label", () => {
    const { container } = renderLogo({ href: "/en" });
    const link = screen.getByRole("link", { name: BRAND.name });
    expect(link.getAttribute("href")).toBe("/en");
    expect(link.hasAttribute("aria-label")).toBe(false);
    expect([...container.querySelectorAll("img")].every((image) => image.alt === BRAND.name)).toBe(true);
  });
});
