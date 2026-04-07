/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const pushMock = vi.fn();
const signInMock = vi.fn();
const logMarketingEventMock = vi.fn();

let pathname = "/en/login";
let search = new URLSearchParams("src=pricing_free_cta");
let authState = { isAuthenticated: false, isLoading: false };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathname,
  useSearchParams: () => search,
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: signInMock }),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => authState,
}));

vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  useMarketingEventLogger: () => logMarketingEventMock,
}));

vi.mock("@base-ui/react/field", () => ({
  Field: {
    Root: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/prototyper-ui/ui/button", () => ({
  Button: ({
    children,
    isPending,
    ...props
  }: {
    children?: React.ReactNode;
    isPending?: boolean;
    [key: string]: unknown;
  }) => (
    <button {...props} disabled={Boolean(props.disabled) || isPending}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/prototyper-ui/ui/input", () => ({
  Input: ({
    ...props
  }: {
    [key: string]: unknown;
  }) => <input {...props} />,
}));

vi.mock("@/components/prototyper-ui/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <label {...props}>{children}</label>,
}));

vi.mock("@/components/prototyper-ui/ui/card", () => ({
  Card: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <section {...props}>{children}</section>
  ),
  CardHeader: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <h2 {...props}>{children}</h2>
  ),
  CardContent: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
}));

beforeEach(() => {
  pathname = "/en/login";
  search = new URLSearchParams("src=pricing_free_cta");
  authState = { isAuthenticated: false, isLoading: false };
  pushMock.mockReset();
  signInMock.mockReset();
  logMarketingEventMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("login page", () => {
  it("reframes auth as create-account plus sign-in and logs the page view with sourceTag", () => {
    render(<LoginPage />);

    expect(screen.getByText("Create your account or sign in")).toBeTruthy();
    expect(screen.getByText("What you get after signing up")).toBeTruthy();
    expect(screen.getByText("Your free account includes:")).toBeTruthy();
    expect(
      screen.getByText("New here? We create your account as soon as you confirm the code.")
    ).toBeTruthy();
    expect(
      screen.getByText(
        "No password needed. We send you a secure code that works for both new and existing accounts."
      )
    ).toBeTruthy();
    expect(
      logMarketingEventMock
    ).toHaveBeenCalledWith({
      eventType: "funnel_login_view",
      locale: "en",
      pagePath: "/en/login",
      section: "login_page",
      sourceTag: "pricing_free_cta",
    });
  });

  it("submits the email flow without losing source attribution", async () => {
    signInMock.mockResolvedValue(undefined);
    render(<LoginPage />);

    const emailInput = screen.getAllByPlaceholderText("you@example.com")[0];

    fireEvent.change(emailInput, {
      target: { value: "rider@example.com" },
    });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("resend", {
        email: "rider@example.com",
      });
    });

    expect(logMarketingEventMock).toHaveBeenCalledWith({
      eventType: "login_code_requested",
      locale: "en",
      pagePath: "/en/login",
      section: "email_form",
      sourceTag: "pricing_free_cta",
    });
    expect(screen.getByText("Enter Verification Code")).toBeTruthy();
  });

  it("keeps English and Dutch auth promises aligned", () => {
    pathname = "/nl/login";
    search = new URLSearchParams("src=pricing_pro_cta");

    render(<LoginPage />);

    expect(screen.getByText("Maak je account aan of log in")).toBeTruthy();
    expect(screen.getByText("Wat je krijgt na het aanmelden")).toBeTruthy();
    expect(
      screen.getByText(
        "Geen wachtwoord nodig. We sturen je een veilige code die werkt voor nieuwe en bestaande accounts."
      )
    ).toBeTruthy();
    expect(
      screen.getByText("Hulp nodig? Mail support als je code niet aankomt of je vastloopt.")
    ).toBeTruthy();
  });
});
