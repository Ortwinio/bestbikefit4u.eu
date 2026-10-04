/* @vitest-environment jsdom */

import { getFunctionName } from "convex/server";
import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { accountCalculatorNavigation } from "@/components/account/account-navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardLayout, { metadata } from "./layout";
import {
  DASHBOARD_MOBILE_HEADER_CLASSNAME,
  DASHBOARD_MOBILE_MENU_OVERLAY_CLASSNAME,
  DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME,
} from "./DashboardLayoutClient";

vi.mock("@/components/profile/AccountProfileStrength", () => ({
  AccountProfileStrength: ({ locale, placement }: { locale: string; placement: string }) =>
    <div data-testid="profile-strength" data-locale={locale} data-placement={placement} />,
}));

it("mounts live profile strength in the mobile account header", () => {
  render(<DashboardLayout>Account page</DashboardLayout>);
  expect(screen.getByTestId("profile-strength").getAttribute("data-placement")).toBe("mobile");
  expect(within(screen.getByRole("banner")).getByTestId("profile-strength")).toBeTruthy();
  expect(within(screen.getByRole("banner")).getByTestId("brand-logo")).toBeTruthy();
});

const { usePathnameMock, useRouterMock, useConvexAuthMock, useQueryMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
  useRouterMock: vi.fn(() => ({ replace: vi.fn() })),
  useConvexAuthMock: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: true,
  })),
  useQueryMock: vi.fn((_reference: Parameters<typeof getFunctionName>[0], ..._args: unknown[]) => ({ _id: "user_1", adminRole: null })),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
  useSearchParams: () => new URLSearchParams("from=test"),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: useConvexAuthMock,
  useQuery: useQueryMock,
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
  LoadingState: ({ label }: { label?: string }) => <div>{label}</div>,
}));

vi.mock("@/components/layout/DashboardSidebar", () => ({
  DashboardSidebar: () => <aside data-testid="sidebar" />,
}));

vi.mock("@/components/account/AccountMenuFooter", () => ({
  AccountMenuFooter: () => <div>Account plan</div>,
}));

vi.mock("@/components/branding", () => ({
  BrandLogo: () => <div data-testid="brand-logo" />,
}));

vi.mock("@/components/layout/LanguageSwitch", () => ({
  LanguageSwitch: () => <div data-testid="language-switch" />,
}));

vi.mock("@/components/dashboard-messages", () => ({
  DashboardMessageSurface: () => <div data-testid="dashboard-message-surface" />,
}));

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: usePathnameMock()?.startsWith("/en/") ? "en" : "nl",
    messages: {
      nav: {
        dashboard: "Dashboard",
        feedback: "Feedback",
        profile: "Profile",
        myBikes: "Bikes",
        newBike: "New bike",
        bikeFitting: "Bike fitting",
        newFitSession: "New fit",
        saddleSelector: "Saddle Selector",
        tirePressure: "Pressure",
        settings: "Settings",
      },
      layout: {
        loading: "Loading dashboard...",
        mobileMenu: {
          closeAria: "Close dashboard menu",
          openAria: "Open dashboard menu",
          overlayCloseAria: "Close dashboard menu overlay",
        },
        sections: {
          dashboard: "Dashboard",
          website: "Website",
        },
        website: {
          home: "Home",
          howItWorks: "How it works",
          pricing: "Pricing",
        },
      },
    },
    languageSwitchLabels: {
      language: "Language",
      english: "English",
      dutch: "Dutch",
    },
  }),
}));

afterEach(() => {
  cleanup();
  useConvexAuthMock.mockReturnValue({ isLoading: false, isAuthenticated: true });
});

function renderLayout(pathname: string) {
  usePathnameMock.mockReturnValue(pathname);
  return renderToStaticMarkup(
    <DashboardLayout>
      <div>Dashboard content</div>
    </DashboardLayout>
  );
}

describe("DashboardLayout feedback context integration", () => {
  it("sets shared server noindex metadata for every account descendant", () => {
    expect(metadata).toEqual({ robots: { index: false, follow: false } });
  });

  it("renders the dashboard shell without legacy local feedback mounting", () => {
    const html = renderLayout("/nl/dashboard");

    expect(html).toContain('data-testid="sidebar"');
    expect(html).toContain("Dashboard content");
    expect(html).toContain('data-testid="dashboard-message-surface"');
    expect(html).toContain("md:grid-cols-[264px_minmax(0,1fr)]");
    expect(html).toContain("hidden bg-[var(--bbf-inkt)] md:row-span-2 md:block");
    expect(html).not.toContain("md:pl-[264px]");
  });

  it.each(["nl", "en"])("does not start Strava queries or auto-import in the %s shell", (locale) => {
    useQueryMock.mockClear();
    const html = renderLayout(`/${locale}/dashboard`);
    expect(html).not.toMatch(/strava/i);
    for (const call of useQueryMock.mock.calls) {
      expect(getFunctionName(call[0])).not.toMatch(/integrations|strava/i);
    }
  });

  it("defines an opaque mobile panel contract", () => {
    expect(DASHBOARD_MOBILE_HEADER_CLASSNAME).not.toContain("bg-card/90");
    expect(DASHBOARD_MOBILE_HEADER_CLASSNAME).not.toContain("backdrop-blur");
    expect(DASHBOARD_MOBILE_MENU_OVERLAY_CLASSNAME).toContain("panel-backdrop");
    expect(DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME).toContain("bg-[var(--bbf-inkt)]");
    expect(DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME).toContain("overflow-y-auto");
  });

  it("exposes the saddle selector in the mobile dashboard menu", () => {
    usePathnameMock.mockReturnValue("/nl/dashboard");

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open dashboard menu" }));

    expect(screen.getByRole("link", { name: "Zadelbreedte" }).getAttribute("href")).toBe(
      "/nl/saddle-selector"
    );
  });

  it("keeps locale and query when switching languages", () => {
    const html = renderLayout("/nl/profile/improve/flexibility");
    expect(html).toContain('/en/profile/improve/flexibility?from=test');
    expect(html).toContain('Accountnavigatie');
    expect(html).toContain('href="/nl/profile" aria-current="page"');
  });

  it("opens a labelled modal from More and closes after navigating", () => {
    usePathnameMock.mockReturnValue("/nl/dashboard");
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    fireEvent.click(screen.getByRole("button", { name: "Meer" }));
    expect(screen.getByRole("dialog", { name: "Meer in je account" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Zadelbreedte" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each(["nl", "en"] as const)("matches desktop calculator destinations in the %s mobile menu", async (locale) => {
    usePathnameMock.mockReturnValue(`/${locale}/tools/frame-size/details`);
    render(<DashboardLayout><button>Outside dialog</button></DashboardLayout>);
    fireEvent.click(screen.getByRole("button", { name: "Open dashboard menu" }));
    const dialog = screen.getByRole("dialog");
    const group = within(dialog).getByRole("region", { name: "Calculators" });
    const tools = accountCalculatorNavigation(locale);
    expect(within(group).getAllByRole("link").map((link) => link.getAttribute("href")))
      .toEqual(tools.map(({ href }) => `/${locale}${href}`));
    for (const tool of tools) expect(within(group).getByRole("link", { name: tool.label })).toBeTruthy();
    const allHrefs = within(dialog).getAllByRole("link").map((link) => link.getAttribute("href"));
    for (const tool of tools) expect(allHrefs.filter((href) => href === `/${locale}${tool.href}`)).toHaveLength(1);
    expect(dialog.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(dialog.querySelector('[aria-current="page"]')?.getAttribute("href"))
      .toBe(`/${locale}/tools/frame-size`);
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    expect(screen.queryByRole("button", { name: "Outside dialog" })).toBeNull();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("does not expose account children before authentication", () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    usePathnameMock.mockReturnValue("/nl/profile");
    useConvexAuthMock.mockReturnValue({ isLoading: false, isAuthenticated: false });
    render(<DashboardLayout><div>Private measurements</div></DashboardLayout>);
    expect(screen.queryByText("Private measurements")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/nl/login");
  });

  it("closes the mobile modal when crossing to desktop", () => {
    let resize: ((event: { matches: boolean }) => void) | undefined;
    const removeEventListener = vi.fn();
    const matchMedia = vi.fn(() => ({
      addEventListener: (_name: string, callback: typeof resize) => { resize = callback; },
      removeEventListener,
    }));
    vi.stubGlobal("matchMedia", matchMedia);
    usePathnameMock.mockReturnValue("/nl/dashboard");
    const { unmount } = render(<DashboardLayout><div>Content</div></DashboardLayout>);
    fireEvent.click(screen.getByRole("button", { name: "Meer" }));
    expect(resize).toBeTypeOf("function");
    act(() => resize?.({ matches: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", resize);
    vi.unstubAllGlobals();
  });
});
