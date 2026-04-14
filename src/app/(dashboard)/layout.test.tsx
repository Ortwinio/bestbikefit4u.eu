/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardLayout, {
  DASHBOARD_MOBILE_HEADER_CLASSNAME,
  DASHBOARD_MOBILE_MENU_OVERLAY_CLASSNAME,
  DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME,
} from "./layout";

const { usePathnameMock, useRouterMock, useConvexAuthMock, useQueryMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
  useRouterMock: vi.fn(() => ({ replace: vi.fn() })),
  useConvexAuthMock: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: true,
  })),
  useQueryMock: vi.fn(() => ({ _id: "user_1", adminRole: null })),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
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

vi.mock("@/components/branding", () => ({
  BrandLogo: () => <div data-testid="brand-logo" />,
}));

vi.mock("@/components/layout/LanguageSwitch", () => ({
  LanguageSwitch: () => <div data-testid="language-switch" />,
}));

vi.mock("@/components/dashboard-messages", () => ({
  DashboardMessageSurface: () => <div data-testid="dashboard-message-surface" />,
}));

vi.mock("@/components/integrations/StravaAutoImportTrigger", () => ({
  StravaAutoImportTrigger: () => null,
}));

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: "nl",
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
  it("renders the dashboard shell without legacy local feedback mounting", () => {
    const html = renderLayout("/nl/dashboard");

    expect(html).toContain('data-testid="sidebar"');
    expect(html).toContain("Dashboard content");
    expect(html).toContain('data-testid="dashboard-message-surface"');
  });

  it("defines an opaque mobile panel contract", () => {
    expect(DASHBOARD_MOBILE_HEADER_CLASSNAME).not.toContain("bg-card/90");
    expect(DASHBOARD_MOBILE_HEADER_CLASSNAME).not.toContain("backdrop-blur");
    expect(DASHBOARD_MOBILE_MENU_OVERLAY_CLASSNAME).toContain("panel-backdrop");
    expect(DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME).toContain("dashboard-sidebar-surface");
    expect(DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME).toContain("dashboard-theme-context");
  });

  it("exposes the saddle selector in the mobile dashboard menu", () => {
    usePathnameMock.mockReturnValue("/nl/dashboard");

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open dashboard menu" }));

    expect(screen.getByRole("link", { name: "Saddle Selector" }).getAttribute("href")).toBe(
      "/nl/saddle-selector"
    );
  });
});
