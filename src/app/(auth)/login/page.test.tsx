/* @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
import AuthLayout, { generateMetadata } from "../layout";

const pushMock = vi.fn();
const signInMock = vi.fn();
const logMarketingEventMock = vi.fn();

let pathname = "/en/login";
let search = new URLSearchParams("src=pricing_free_cta");
let authState = { isAuthenticated: false, isLoading: false };
let campaignActive = true;

vi.mock("@/i18n/request", () => ({
  getRequestLocale: async () => pathname.startsWith("/nl") ? "nl" : "en",
}));

vi.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

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

vi.mock("@/config/commercial", async () => {
  const actual = await vi.importActual<typeof import("@/config/commercial")>(
    "@/config/commercial"
  );

  return {
    ...actual,
    isConsumerCampaignActive: () => campaignActive,
  };
});

vi.mock("@/components/campaign/CampaignCtaGroup", () => ({
  CampaignCtaGroup: ({
    startHref,
    donateHref,
    startLabel,
    donateLabel,
  }: {
    startHref: string;
    donateHref: string;
    startLabel?: string;
    donateLabel?: string;
  }) => (
    <div>
      <a href={startHref}>{startLabel ?? "Start free bike fit"}</a>
      <a href={donateHref}>{donateLabel ?? "Donate first"}</a>
    </div>
  ),
}));

vi.mock("@base-ui/react/field", () => ({
  Field: {
    Root: ({
      children,
      invalid,
      ...props
    }: {
      children?: React.ReactNode;
      invalid?: boolean;
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
    invalid,
    ...props
  }: {
    invalid?: boolean;
    [key: string]: unknown;
  }) => <input {...(invalid ? { "aria-invalid": true } : {})} {...props} />,
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
  campaignActive = true;
  pushMock.mockReset();
  signInMock.mockReset();
  logMarketingEventMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
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
    expect(screen.getByText("Temporary free access")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
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

    expect(screen.getByText("Maak je account aan en log in")).toBeTruthy();
    expect(screen.getByText("Wat je krijgt na het aanmelden")).toBeTruthy();
    expect(
      screen.getByText(
        "Geen wachtwoord nodig. We sturen je een veilige code die werkt voor nieuwe en bestaande accounts."
      )
    ).toBeTruthy();
    expect(
      screen.getByText("Hulp nodig? Mail support als je code niet aankomt of je vastloopt.")
    ).toBeTruthy();
    expect(screen.getByText("Tijdelijk gratis toegang")).toBeTruthy();
  });

  it("does not start Google sign-in while Convex auth is still loading", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_AUTH_ENABLED", "true");
    authState = { isAuthenticated: false, isLoading: true };

    render(<LoginPage />);

    const googleButton = screen.getByRole("button", { name: /continue with google/i });
    expect(googleButton).toHaveProperty("disabled", true);

    fireEvent.click(googleButton);

    expect(signInMock).not.toHaveBeenCalled();
  });
});

it("does not claim a code was sent when delivery fails", async () => {
  signInMock.mockRejectedValue(new Error("Email sign-in is temporarily unavailable"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<LoginPage />);
  const input = screen.getByPlaceholderText("you@example.com");
  fireEvent.change(input, { target: { value: "rider@example.com" } });
  fireEvent.submit(input.closest("form")!);
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Failed to send"));
  expect(screen.queryByText("Enter Verification Code")).toBeNull();
});

it("normalizes pasted codes and requires an authenticated sign-in result", async () => {
  signInMock.mockResolvedValueOnce({ signingIn: false }).mockResolvedValueOnce({ signingIn: false });
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<LoginPage />);
  const input = screen.getByPlaceholderText("you@example.com");
  fireEvent.change(input, { target: { value: "Rider@example.com" } });
  fireEvent.submit(input.closest("form")!);
  const code = await screen.findByPlaceholderText("Enter verification code");
  fireEvent.change(code, { target: { value: " abc defg " } });
  expect(code).toHaveProperty("value", "ABCDEFG");
  expect(code.getAttribute("autocomplete")).toBe("one-time-code");
  fireEvent.submit(code.closest("form")!);
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Invalid or expired"));
  expect(signInMock).toHaveBeenLastCalledWith("resend", { email: "Rider@example.com", code: "ABCDEFG" });
  expect(screen.queryByText("Welcome to BestBikeFit4U")).toBeNull();
  expect(logMarketingEventMock).not.toHaveBeenCalledWith(expect.objectContaining({ eventType: "login_verified" }));
});

it("shows success only after a code establishes a session", async () => {
  signInMock.mockResolvedValueOnce({ signingIn: false }).mockResolvedValueOnce({ signingIn: true });
  render(<LoginPage />);
  const input = screen.getByPlaceholderText("you@example.com");
  fireEvent.change(input, { target: { value: "rider@example.com" } });
  fireEvent.submit(input.closest("form")!);
  const code = await screen.findByPlaceholderText("Enter verification code");
  fireEvent.change(code, { target: { value: "ABCDEFG" } });
  fireEvent.submit(code.closest("form")!);
  expect(await screen.findByText("Welcome to BestBikeFit4U")).toBeTruthy();
  expect(screen.getByRole("status").textContent).toContain("Redirecting to your dashboard");
  expect(pushMock).not.toHaveBeenCalled();
});

it("keeps the resend cooldown, retry feedback and email reset", async () => {
  vi.useFakeTimers();
  signInMock.mockResolvedValue({ signingIn: false });
  render(<LoginPage />);
  const emailInput = screen.getByLabelText("Email address");
  fireEvent.change(emailInput, { target: { value: " Rider@example.com " } });
  await act(async () => { fireEvent.submit(emailInput.closest("form")!); });
  expect(signInMock).toHaveBeenLastCalledWith("resend", { email: "Rider@example.com" });
  expect(screen.getByRole("button", { name: "Resend available in 30s" })).toHaveProperty("disabled", true);
  for (let seconds = 0; seconds < 30; seconds += 1) {
    await act(async () => { vi.advanceTimersByTime(1000); });
  }
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /didn't receive the code/i }));
  });
  expect(signInMock).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("button", { name: "Resend available in 30s" })).toHaveProperty("disabled", true);
  expect(logMarketingEventMock).toHaveBeenCalledWith(expect.objectContaining({
    eventType: "login_code_resent", sourceTag: "pricing_free_cta", section: "code_form",
  }));
  expect(screen.getByRole("status").textContent).toContain("New code sent");
  fireEvent.click(screen.getByRole("button", { name: "Use a different email" }));
  expect(screen.getByLabelText("Email address")).toHaveProperty("value", "Rider@example.com");
  expect(screen.queryByLabelText("Verification Code")).toBeNull();
  expect(screen.queryByRole("status")).toBeNull();
});

it.each(["en", "nl"])("redirects authenticated %s sessions to the localized dashboard", (locale) => {
  pathname = `/${locale}/login`;
  authState = { isAuthenticated: true, isLoading: false };
  render(<LoginPage />);
  expect(pushMock).toHaveBeenCalledWith(`/${locale}/dashboard`);
});

it("keeps Google locale, source tracking and failure recovery", async () => {
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_AUTH_ENABLED", "true");
  pathname = "/nl/login";
  signInMock.mockResolvedValue({});
  render(<LoginPage />);
  fireEvent.click(screen.getByRole("button", { name: "Doorgaan met Google" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Google-login kon niet worden gestart"));
  expect(signInMock).toHaveBeenCalledWith("google", { redirectTo: "/nl/dashboard" });
  expect(logMarketingEventMock).toHaveBeenCalledWith(expect.objectContaining({
    eventType: "login_google_started", locale: "nl", sourceTag: "pricing_free_cta",
  }));
  expect(screen.getByRole("button", { name: "Doorgaan met Google" })).toHaveProperty("disabled", false);
  expect(Reflect.get(window, "__bbfSuppressBeforeUnload")).toBe(false);
});

it("keeps one page heading and a localized calculator link with the campaign off", () => {
  campaignActive = false;
  pathname = "/nl/login";
  render(<LoginPage />);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.queryByText("Tijdelijk gratis toegang")).toBeNull();
  expect(screen.getByRole("link", { name: "Probeer de calculator zonder account" }).getAttribute("href")).toBe("/nl/calculators/bike-fit");
  expect(screen.queryByRole("button", { name: /google/i })).toBeNull();
  expect(screen.queryByText("Ontwerpstaat")).toBeNull();
  expect(screen.queryByText("Voorbeeld")).toBeNull();
});

it("shows a resend error without leaving code entry or claiming success", async () => {
  vi.useFakeTimers();
  vi.spyOn(console, "error").mockImplementation(() => {});
  signInMock.mockResolvedValueOnce({ signingIn: false }).mockRejectedValueOnce(new Error("Delivery failed"));
  render(<LoginPage />);
  const emailInput = screen.getByLabelText("Email address");
  fireEvent.change(emailInput, { target: { value: "rider@example.com" } });
  await act(async () => { fireEvent.submit(emailInput.closest("form")!); });
  for (let seconds = 0; seconds < 30; seconds += 1) {
    await act(async () => { vi.advanceTimersByTime(1000); });
  }
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /didn't receive the code/i }));
  });
  expect(screen.getByRole("alert").textContent).toContain("Failed to resend code");
  expect(screen.getByLabelText("Verification Code")).toBeTruthy();
  expect(screen.queryByRole("status")).toBeNull();
  expect(logMarketingEventMock).toHaveBeenCalledWith(expect.objectContaining({
    eventType: "login_send_error", section: "code_form_resend", sourceTag: "pricing_free_cta",
  }));
});

it("recovers from a rejected Google request and logs its error", async () => {
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_AUTH_ENABLED", "true");
  vi.spyOn(console, "error").mockImplementation(() => {});
  signInMock.mockRejectedValue(new Error("OAuth failed"));
  render(<LoginPage />);
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Google sign-in could not be started"));
  expect(logMarketingEventMock).toHaveBeenCalledWith(expect.objectContaining({
    eventType: "login_google_error", section: "google_button", sourceTag: "pricing_free_cta",
  }));
  expect(Reflect.get(window, "__bbfSuppressBeforeUnload")).toBe(false);
  expect(screen.getByRole("button", { name: "Send Login Code" })).toHaveProperty("disabled", false);
});

it("renders the login in one full-width main without a layout-owned logo", () => {
  const { container } = render(<AuthLayout><LoginPage /></AuthLayout>);
  const main = screen.getByRole("main");
  expect(main.id).toBe("main-content");
  expect(main.tabIndex).toBe(-1);
  expect(main.parentElement).toBe(container);
  expect(main.className).not.toContain("max-w");
  expect(screen.getAllByRole("link", { name: "BestBikeFit4U" })).toHaveLength(2);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
});

it.each(["en", "nl"])("preserves %s login metadata and indexing rules", async (locale) => {
  pathname = `/${locale}/login`;
  const metadata = await generateMetadata();
  expect(metadata.title).toBe(locale === "nl" ? "Inloggen | BestBikeFit4U" : "Sign In | BestBikeFit4U");
  expect(metadata.robots).toEqual({ index: false, follow: true });
  expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}/login`);
});
