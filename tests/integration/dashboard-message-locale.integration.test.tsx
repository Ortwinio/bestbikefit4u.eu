import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
const { usePathnameMock, useRouterMock, useConvexAuthMock, useQueryMock, useMutationMock } =
  vi.hoisted(() => ({
    usePathnameMock: vi.fn(),
    useRouterMock: vi.fn(() => ({ replace: vi.fn() })),
    useConvexAuthMock: vi.fn(() => ({
      isLoading: false,
      isAuthenticated: true,
    })),
    useQueryMock: vi.fn(),
    useMutationMock: vi.fn(() => vi.fn()),
  }));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
}));

vi.mock("convex/react", () => ({
  useConvexAuth: useConvexAuthMock,
  useQuery: useQueryMock,
  useMutation: useMutationMock,
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
  LoadingState: ({ label }: { label?: string }) => <div>{label}</div>,
  AccessibleDialog: ({
    open,
    title,
    description,
    children,
  }: {
    open: boolean;
    title: string;
    description?: string;
    children?: ReactNode;
  }) =>
    open ? (
      <div data-testid="dialog">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {children}
      </div>
    ) : null,
}));

vi.mock("@/components/layout/DashboardSidebar", () => ({
  DashboardSidebar: () => <aside data-testid="sidebar" />,
}));

vi.mock("@/components/layout/LanguageSwitch", () => ({
  LanguageSwitch: () => <div data-testid="language-switch" />,
}));

vi.mock("@/components/feedback", () => ({
  FeedbackFloatingButton: ({ label }: { label: string }) => (
    <button data-testid="feedback-floating-button">{label}</button>
  ),
  FeedbackDialog: () => <div data-testid="feedback-dialog" />,
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
        tirePressure: "Pressure",
        settings: "Settings",
      },
      layout: {
        loading: "Dashboard laden...",
        mobileMenu: {
          closeAria: "Sluit dashboardmenu",
          openAria: "Open dashboardmenu",
          overlayCloseAria: "Sluit dashboardmenu-overlay",
        },
        sections: {
          dashboard: "Dashboard",
          website: "Website",
        },
        website: {
          home: "Home",
          howItWorks: "Hoe het werkt",
          pricing: "Prijzen",
        },
      },
    },
    languageSwitchLabels: {
      language: "Taal",
      english: "Engels",
      dutch: "Nederlands",
    },
  }),
}));

import DashboardLayout from "../../src/app/(dashboard)/layout";

describe("dashboard message locale integration", () => {
  it("renders a locale-targeted dashboard banner in the shell", () => {
    usePathnameMock.mockReturnValue("/nl/dashboard");
    useQueryMock.mockImplementation((_fn: unknown, args?: unknown) => {
      expect(args).toEqual({ locale: "nl" });
      return [
        {
          _id: "msg_nl_1",
          title: "Nederlandse banner",
          body: "Alleen zichtbaar in het Nederlandse dashboard.",
          type: "banner",
          priority: "normal",
          status: "published",
          dismissible: true,
          requiresAcknowledgement: false,
          locale: "nl",
          createdAt: 1,
        },
      ];
    });

    const html = renderToStaticMarkup(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    );

    expect(html).toContain("Nederlandse banner");
    expect(html).toContain("Alleen zichtbaar in het Nederlandse dashboard.");
  });
});
