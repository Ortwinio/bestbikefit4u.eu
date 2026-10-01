/* @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { accountCalculatorNavigation } from "@/components/account/account-navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardSidebar } from "./DashboardSidebar";

const { usePathnameMock, useRouterMock, signOutMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(() => "/nl/dashboard"),
  useRouterMock: vi.fn(() => ({ push: vi.fn() })),
  signOutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signOut: signOutMock }),
}));

vi.mock("convex/react", () => ({
  useQuery: () => ({
    _id: "user_1",
    email: "rider@example.com",
    adminRole: null,
  }),
}));

vi.mock("@/components/branding", () => ({
  BrandLogo: ({ href, ariaLabel }: { href: string; ariaLabel?: string }) => (
    <a href={href} aria-label={ariaLabel}>
      Brand
    </a>
  ),
}));

vi.mock("@/components/layout/LanguageSwitch", () => ({
  LanguageSwitch: () => <div data-testid="language-switch" />,
}));

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: usePathnameMock().startsWith("/en/") ? "en" : "nl",
    messages: {
      nav: {
        dashboard: "Dashboard",
        profile: "Profile",
        myBikes: "Bikes",
        newBike: "New bike",
        bikeFitting: "Bike fitting",
        newFitSession: "New fit",
        tirePressure: "Pressure",
        gearing: "Gearing",
        saddleSelector: "Saddle Selector",
        settings: "Settings",
        feedback: "Feedback",
      },
      layout: {
        website: {
          home: "Home",
        },
        sections: {
          dashboard: "Dashboard",
          admin: "Admin",
        },
      },
      userMenu: {
        fallbackUserName: "User",
      },
      common: {
        signOut: "Sign out",
      },
    },
    languageSwitchLabels: {
      language: "Language",
    },
  }),
}));

vi.mock("@/components/profile/ProfilePhotoUpload", () => ({
  ProfilePhotoUpload: () => <div data-testid="profile-photo" />,
}));

vi.mock("@/components/account/AccountPlan", () => ({
  AccountPlan: () => <div>Account plan</div>,
}));

vi.mock("@/lib/userIdentity", () => ({
  getEffectiveDisplayName: () => "Test Rider",
  getEffectiveProfileImageSource: () => null,
}));

vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

afterEach(() => {
  cleanup();
});

describe("DashboardSidebar", () => {
  it("keeps navigation sticky inside the full-height account column", () => {
    render(<DashboardSidebar />);
    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("sticky top-0");
    expect(sidebar.className).not.toContain("fixed");
  });

  it("links the saddle selector to the canonical dashboard route", () => {
    render(<DashboardSidebar />);

    expect(
      screen.getByRole("link", { name: "Zadelbreedte" }).getAttribute("href")
    ).toBe("/nl/saddle-selector");
  });

  it.each(["nl", "en"] as const)("renders the shared calculator group with localized %s paths", (locale) => {
    usePathnameMock.mockReturnValue(`/${locale}/tools/saddle-height/details`);
    render(<DashboardSidebar />);
    const group = screen.getByRole("navigation", { name: "Calculators" });
    const tools = accountCalculatorNavigation(locale);
    expect(within(group).getAllByRole("link").map((link) => link.getAttribute("href")))
      .toEqual(tools.map(({ href }) => `/${locale}${href}`));
    for (const tool of tools) expect(within(group).getByRole("link", { name: tool.label })).toBeTruthy();
    expect(group.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(group.querySelector('[aria-current="page"]')?.getAttribute("href"))
      .toBe(`/${locale}/tools/saddle-height`);
  });
});
