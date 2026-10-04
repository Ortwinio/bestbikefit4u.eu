/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";
import { getDutchGuideTitle } from "@/i18n/marketing/guideTitles";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MarketingAccountLink, MarketingLanguageSwitch } from "./MarketingNavigation";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/nl/how-it-works",
  useSearchParams: () => new URLSearchParams("source=test"),
  useRouter: () => ({ push: vi.fn() }),
}));
const auth = vi.hoisted(() => ({ isAuthenticated: false }));
vi.mock("convex/react", () => ({ useConvexAuth: () => auth, useMutation: () => vi.fn() }));
vi.mock("@convex-dev/auth/react", () => ({ useAuthActions: () => ({ signOut: vi.fn() }) }));
vi.mock("@/components/branding", () => ({
  BrandLogo: ({ href }: { href: string }) => <a href={href}>BikeFitBoost</a>,
}));
afterEach(() => { cleanup(); auth.isAuthenticated = false; });

const mobileLabels = {
  howItWorks: nl.nav.howItWorks, tools: "Calculators", pricing: nl.nav.pricing,
  login: nl.nav.login, getStarted: "Start gratis bike fit", dashboard: "Dashboard",
  newFitSession: "Nieuwe fit", bikeFitting: "Mijn fits", myBikes: "Mijn fietsen",
  profile: "Profiel", signOut: "Uitloggen",
};

describe("marketing layout", () => {
  it("retains dashboard access for an authenticated rider", () => {
    auth.isAuthenticated = true;
    render(<MarketingAccountLink locale="en" loginLabel="Log in" dashboardLabel="Dashboard" />);
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/en/dashboard");
  });
  it("uses the approved header links, one primary action and active-page semantics", () => {
    render(<Header locale="nl" labels={{ common: nl.common, nav: nl.nav, dashboardNav: nl.dashboard.nav, dashboardSignOut: nl.dashboard.common.signOut }} />);
    const nav = screen.getByRole("navigation", { name: "Hoofdmenu" });
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/nl/calculators/bike-fit", "/nl/how-it-works", "/nl/guides", "/nl/pricing",
    ]);
    expect(within(nav).getByRole("link", { name: nl.nav.howItWorks }).getAttribute("aria-current")).toBe("page");
    expect(screen.getAllByRole("link", { name: "Start gratis bike fit" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Start gratis bike fit" }).getAttribute("href")).toBe("/nl/calculators/bike-fit");
    expect(screen.getByRole("link", { name: nl.nav.login }).className).not.toContain("bg-");
  });

  it("preserves the current page and query when changing language, NL first", () => {
    render(<MarketingLanguageSwitch locale="nl" placement="menu" />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["NL", "EN"]);
    expect(links[1].getAttribute("href")).toBe("/en/how-it-works?source=test");
    expect(links[0].getAttribute("aria-current")).toBe("page");
  });

  it("retains footer routes and uses stroke icons instead of legacy colored logos", () => {
    const { container } = render(<Footer locale="nl" labels={{ howItWorks: nl.nav.howItWorks, pricing: nl.nav.pricing, footer: nl.nav.footer }} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
    expect(screen.getByRole("link", { name: nl.nav.footer.tirePressure }).getAttribute("href")).toBe("/nl/bandenspanning-calculator");
    expect(screen.getByRole("link", { name: nl.nav.footer.sitemap }).getAttribute("href")).toBe("/sitemap.xml");
    expect(container.querySelectorAll("svg[stroke='currentColor']")).toHaveLength(8);
  });

  it("opens a localized mobile menu with the same CTA and closes it accessibly", async () => {
    render(<HeaderMobileMenu locale="nl" labels={mobileLabels} />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigatiemenu" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("link", { name: "Gidsen" }).getAttribute("href")).toBe("/nl/guides");
    expect(within(dialog).getByRole("link", { name: "Start gratis bike fit" }).getAttribute("href")).toBe("/nl/calculators/bike-fit");
    fireEvent.click(within(dialog).getByRole("button", { name: "Sluit navigatiemenu" }));
  });

  it("uses Dutch support labels and canonical guide titles in the footer", () => {
    render(<Footer locale="nl" labels={{ howItWorks: nl.nav.howItWorks, pricing: nl.nav.pricing, footer: nl.nav.footer }} />);
    expect(screen.getByRole("heading", { name: "Hulp" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Fietspaspoort controleren" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Veelgestelde vragen" })).toBeTruthy();
    const title = getDutchGuideTitle("saddle-height-guide");
    expect(title).toBeTruthy();
    expect(screen.getByRole("link", { name: title! }).getAttribute("href"))
      .toBe("/nl/guides/saddle-height-guide");
    expect(screen.queryByText("Support")).toBeNull();
  });

  it("keeps English footer copy unchanged", () => {
    render(<Footer locale="en" labels={{ howItWorks: en.nav.howItWorks, pricing: en.nav.pricing, footer: en.nav.footer }} />);
    expect(screen.getByRole("heading", { name: en.nav.footer.support })).toBeTruthy();
    expect(screen.getByRole("link", { name: en.nav.footer.passportCheck })).toBeTruthy();
    expect(screen.getByRole("link", { name: en.nav.footer.saddleHeightGuide })).toBeTruthy();
  });
});


it.each(["nl", "en"] as const)("links the footer directly to the bike-fitting owner in %s", locale => {
  const dictionary = locale === "nl" ? nl : en;
  render(<Footer locale={locale} labels={{howItWorks:dictionary.nav.howItWorks,
    pricing:dictionary.nav.pricing,footer:dictionary.nav.footer}} />);
  expect(screen.getByRole("link",{name:locale==="nl"?"Wat is bikefitting?":"What is bike fitting?"})
    .getAttribute("href")).toBe(locale==="nl"?"/nl/bikefitting":"/en/bike-fitting");
});


it.each(["nl", "en"] as const)("gives header and footer language landmarks distinct names in %s", locale => {
  const dictionary = locale === "nl" ? nl : en;
  render(<>
    <Header locale={locale} labels={{
      common: dictionary.common, nav: dictionary.nav, dashboardNav: dictionary.dashboard.nav,
      dashboardSignOut: dictionary.dashboard.common.signOut,
    }} />
    <Footer locale={locale} labels={{
      howItWorks: dictionary.nav.howItWorks, pricing: dictionary.nav.pricing, footer: dictionary.nav.footer,
    }} />
  </>);
  const names = locale === "nl"
    ? ["Taal (menu)", "Taal (voettekst)"]
    : ["Language (menu)", "Language (footer)"];
  for (const name of names) {
    const landmark = screen.getByRole("navigation", { name });
    expect(within(landmark).getAllByRole("link").map(link => link.textContent)).toEqual(["NL", "EN"]);
  }
  expect(screen.queryByRole("navigation", { name: locale === "nl" ? "Taal" : "Language" }))
    .toBeNull();
});
