/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfiguratorHeaderSwitch } from "./ConfiguratorHeaderSwitch";

vi.mock("next/navigation", () => ({ usePathname: () => "/nl/calculators/saddle-height" }));
vi.mock("@/components/branding", () => ({
  BrandLogo: ({ className, imageClassName }: { className: string; imageClassName: string }) => (
    <a href="/nl" className={className}><span role="img" aria-label="BikeFitBoost" className={imageClassName} /></a>
  ),
}));
vi.mock("@/components/ui/ToolsTabBar", () => ({
  ToolsTabBar: ({ className }: { className: string }) => <nav aria-label="Tools" className={className} />,
}));
vi.mock("./LanguageSwitch", () => ({ LanguageSwitch: () => <button>NL / EN</button> }));
afterEach(cleanup);

describe("configurator brand header", () => {
  it("allows mobile controls to wrap without shrinking the 34px logo or hiding actions", () => {
    render(<ConfiguratorHeaderSwitch locale="nl" loginLabel="Inloggen"
      languageLabels={{ language: "Taal", english: "Engels", dutch: "Nederlands" }}>Fallback</ConfiguratorHeaderSwitch>);
    const logo = screen.getByRole("img", { name: "BikeFitBoost" });
    expect(logo.className).toContain("h-[34px]");
    expect(logo.closest("header")?.firstElementChild?.className).toContain("flex-wrap");
    expect(screen.getByRole("navigation", { name: "Tools" }).className).toContain("basis-full");
    expect(screen.getByRole("link", { name: "Inloggen" }).className).toContain("min-h-11");
    expect(screen.getByRole("button", { name: "NL / EN" })).toBeTruthy();
  });
});
