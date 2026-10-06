/* @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
import AuthLayout, { generateMetadata } from "../layout";
import { HANDOFF_KEY } from "@/lib/handoff/store";
import { loginHandoffCopy } from "@/i18n/account/loginHandoff";
import { NEWSLETTER_INTENT_KEY } from "@/lib/newsletter/signupIntent";

const pushMock = vi.fn();
const signInMock = vi.fn();
const logMarketingEventMock = vi.fn();
const newsletterSaveMock = vi.fn();

let pathname = "/en/login";
let search = new URLSearchParams("src=pricing_free_cta");
let authState = { isAuthenticated: false, isLoading: false };

it("requests the Dutch login email with a Dutch redirect", async () => {
  pathname = "/nl/login";
  signInMock.mockResolvedValue({ signingIn: false });
  render(<LoginPage />);
  const input = screen.getAllByPlaceholderText("jij@example.com")[0];
  fireEvent.change(input, { target: { value: "rider@example.com" } });
  fireEvent.submit(input.closest("form")!);
  await waitFor(() => expect(signInMock).toHaveBeenCalledWith("resend", {
    email: "rider@example.com", locale: "nl", redirectTo: "/nl/dashboard",
  }));
});

vi.mock("@/i18n/request", () => ({
  getRequestLocale: async () => pathname.startsWith("/nl") ? "nl" : "en",
}));

vi.mock("@/i18n/getDictionary", () => ({
  getDictionary: async (locale: string) => locale === "nl"
    ? (await import("@/i18n/messages/nl")).default
    : (await import("@/i18n/messages/en")).default,
}));

vi.mock("@/components/layout/Header", () => ({
  Header: ({ locale }: { locale: string }) => <header data-usability="site-header"><a href={`/${locale}`}>BikeFitBoost</a></header>,
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
  useQuery: () => ({ email: "Rider@example.com" }),
  useMutation: () => newsletterSaveMock,
}));

vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  useMarketingEventLogger: () => logMarketingEventMock,
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
  sessionStorage.clear();
  pathname = "/en/login";
  search = new URLSearchParams("src=pricing_free_cta");
  authState = { isAuthenticated: false, isLoading: false };
  pushMock.mockReset();
  signInMock.mockReset();
  logMarketingEventMock.mockReset();
  newsletterSaveMock.mockReset().mockResolvedValue({ newsletter: true, granted: true });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("gift login return", () => {
  it.each(["nl", "en"] as const)("returns authenticated %s recipients to the fixed gift route", async (locale) => {
    pathname = `/${locale}/login`;
    search = new URLSearchParams("gift=1&redirect=https://evil.example");
    authState = { isAuthenticated: true, isLoading: false };
    render(<LoginPage />);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(`/${locale}/gift`));
  });

  it("passes a token-free localized gift return to email sign-in", async () => {
    pathname = "/nl/login";
    search = new URLSearchParams("gift=1");
    signInMock.mockResolvedValue({ signingIn: false });
    render(<LoginPage />);
    const input = screen.getAllByPlaceholderText("jij@example.com")[0];
    fireEvent.change(input, { target: { value: "recipient@example.com" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(signInMock).toHaveBeenCalledWith("resend", {
      email: "recipient@example.com", locale: "nl", redirectTo: "/nl/gift",
    }));
  });
});

describe("calculator handoff login", () => {
  const fixture = () => JSON.stringify({ version: 1, entries: [{
    field: "inseamCm", value: 82.5, unit: "cm", calculator: "saddle-height",
    method: "measured", touchedAt: Date.now(),
  }] });

  it.each(["en", "nl"] as const)("shows %s stored values without importing or logging them", async (locale) => {
    pathname = `/${locale}/login`;
    search = new URLSearchParams("src=saddle-height&handoff=1");
    const stored = fixture();
    sessionStorage.setItem(HANDOFF_KEY, stored);
    render(<LoginPage />);
    expect(await screen.findByText(loginHandoffCopy[locale].title)).toBeTruthy();
    expect(screen.getByText(`${(82.5).toLocaleString(locale)} cm`)).toBeTruthy();
    expect(screen.queryByText("Ontwerpstaat")).toBeNull();
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBe(stored);
    expect(JSON.stringify(logMarketingEventMock.mock.calls)).not.toContain("82.5");
  });

  it.each([null, "{broken", '{"version":2,"entries":[]}'])("keeps login usable with unusable storage %s", (stored) => {
    search = new URLSearchParams("handoff=1");
    if (stored !== null) sessionStorage.setItem(HANDOFF_KEY, stored);
    render(<LoginPage />);
    expect(screen.getByText(loginHandoffCopy.en.empty)).toBeTruthy();
    expect(screen.getAllByPlaceholderText("you@example.com").length).toBeGreaterThan(0);
  });

  it.each(["en", "nl"] as const)("routes authenticated %s handoffs to welcome without clearing", async (locale) => {
    pathname = `/${locale}/login`;
    search = new URLSearchParams("handoff=1");
    const stored = fixture();
    sessionStorage.setItem(HANDOFF_KEY, stored);
    authState = { isAuthenticated: true, isLoading: true };
    const view = render(<LoginPage />);
    expect(pushMock).not.toHaveBeenCalled();
    authState = { isAuthenticated: true, isLoading: false };
    view.rerender(<LoginPage />);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(`/${locale}/welcome`));
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBe(stored);
  });

  it.each(["0", "true"])("does not activate the handoff panel for flag %s", (flag) => {
    search = new URLSearchParams(`handoff=${flag}`);
    render(<LoginPage />);
    expect(screen.queryByText(loginHandoffCopy.en.title)).toBeNull();
  });

  it.each(["en", "nl"] as const)("offers session values on plain %s login without a handoff flag", async locale => {
    pathname = `/${locale}/login`;
    search = new URLSearchParams();
    const stored = fixture();
    sessionStorage.setItem(HANDOFF_KEY, stored);
    signInMock.mockResolvedValue({ signingIn: false });
    render(<LoginPage />);
    expect(await screen.findByText(loginHandoffCopy[locale].title)).toBeTruthy();
    const input = screen.getAllByPlaceholderText(locale === "nl" ? "jij@example.com" : "you@example.com")[0];
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(signInMock).toHaveBeenCalledWith("resend", {
      email: "test@example.com", locale, redirectTo: `/${locale}/welcome`,
    }));
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBe(stored);
  });

  it("keeps the gift destination ahead of stored calculator data", async () => {
    search = new URLSearchParams("gift=1");
    sessionStorage.setItem(HANDOFF_KEY, fixture());
    signInMock.mockResolvedValue({ signingIn: false });
    render(<LoginPage />);
    const input = screen.getAllByPlaceholderText("you@example.com")[0];
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(signInMock).toHaveBeenCalledWith("resend", {
      email: "test@example.com", locale: "en", redirectTo: "/en/gift",
    }));
  });

  it("sends only auth parameters and the clean welcome destination", async () => {
    search = new URLSearchParams("handoff=1&src=saddle-height");
    signInMock.mockResolvedValue({ signingIn: false });
    render(<LoginPage />);
    const input = screen.getAllByPlaceholderText("you@example.com")[0];
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(signInMock).toHaveBeenCalledWith("resend", {
      email: "test@example.com", locale: "en", redirectTo: "/en/welcome",
    }));
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe("login page", () => {
  it.each(["nl", "en"] as const)("describes the actual free account benefits in %s", locale => {
    pathname = `/${locale}/login`;
    render(<LoginPage />);
    expect(screen.getByText(locale === "nl" ? "Bewaar je maten in je riderprofiel"
      : "Save your measurements in your rider profile")).toBeTruthy();
    expect(screen.getByText(locale === "nl" ? "Mail de kernwaarden van je laatste fitrapport"
      : "Email the core values from your latest fit report")).toBeTruthy();
    expect(screen.queryByText(/complete fit analysis|complete fitanalyse|prioriteitsvolgorde|Prioritized adjustment sequence/)).toBeNull();
  });
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
    expect(screen.queryByText("Temporary free access")).toBeNull();
    expect(screen.getByText("Try the calculator without an account").closest("a")?.getAttribute("href")).toBe(
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
        locale: "en", redirectTo: "/en/dashboard",
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
    expect(screen.queryByText("Tijdelijk gratis toegang")).toBeNull();
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
  expect(signInMock).toHaveBeenLastCalledWith("resend", {
    email: "Rider@example.com", code: "ABCDEFG", locale: "en", redirectTo: "/en/dashboard",
  });
  expect(screen.queryByText("Welcome to BikeFitBoost")).toBeNull();
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
  expect(await screen.findByText("Welcome to BikeFitBoost")).toBeTruthy();
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
  expect(signInMock).toHaveBeenLastCalledWith("resend", {
    email: "Rider@example.com", locale: "en", redirectTo: "/en/dashboard",
  });
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

it.each(["en", "nl"])("redirects authenticated %s sessions to the localized dashboard", async (locale) => {
  pathname = `/${locale}/login`;
  authState = { isAuthenticated: true, isLoading: false };
  render(<LoginPage />);
  await waitFor(() => expect(pushMock).toHaveBeenCalledWith(`/${locale}/dashboard`));
});

describe("explicit newsletter signup choice", () => {
  it.each(["nl", "en"] as const)("starts unchecked and does not infer consent in %s", locale => {
    pathname = `/${locale}/login`;
    render(<LoginPage />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(sessionStorage.getItem(NEWSLETTER_INTENT_KEY)).toBeNull();
    expect(newsletterSaveMock).not.toHaveBeenCalled();
  });

  it("binds a checked email choice to verification, saves before redirect and retains the handoff", async () => {
    search = new URLSearchParams("handoff=1");
    signInMock.mockResolvedValueOnce({ signingIn: false }).mockResolvedValueOnce({ signingIn: true });
    const view = render(<LoginPage />);
    fireEvent.click(screen.getByRole("checkbox"));
    const input = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(input, { target: { value: "Rider@example.com" } });
    fireEvent.submit(input.closest("form")!);
    await screen.findByLabelText("Verification Code");
    expect(newsletterSaveMock).not.toHaveBeenCalled();
    const intent = JSON.parse(sessionStorage.getItem(NEWSLETTER_INTENT_KEY)!);
    expect(Object.keys(intent)).not.toContain("email");
    expect(signInMock.mock.calls[0][1].redirectTo).toBe("/en/login?handoff=1");
    const code = screen.getByLabelText("Verification Code");
    fireEvent.change(code, { target: { value: "ABC1234" } });
    fireEvent.submit(code.closest("form")!);
    await waitFor(() => expect(signInMock).toHaveBeenCalledTimes(2));
    authState = { isAuthenticated: true, isLoading: false };
    view.rerender(<LoginPage />);
    await waitFor(() => expect(newsletterSaveMock).toHaveBeenCalledOnce());
    expect(newsletterSaveMock).toHaveBeenCalledWith({ subscribed: true, source: "signup",
      expectedEmail: "Rider@example.com", consent: { requestId: intent.requestId, locale: "en", wordingVersion: "newsletter-v1" } });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/en/welcome"));
    expect(sessionStorage.getItem(NEWSLETTER_INTENT_KEY)).toBeNull();
    expect(logMarketingEventMock).toHaveBeenCalledWith({ eventType: "newsletter_opt_in", locale: "en",
      pagePath: "/en/login", section: "newsletter" });
  });

  it("clears a staged choice when the user explicitly unchecks it or changes address", async () => {
    signInMock.mockResolvedValue({ signingIn: false });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("checkbox"));
    const input = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(input, { target: { value: "Rider@example.com" } });
    fireEvent.submit(input.closest("form")!);
    await screen.findByLabelText("Verification Code");
    expect(sessionStorage.getItem(NEWSLETTER_INTENT_KEY)).not.toBeNull();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(sessionStorage.getItem(NEWSLETTER_INTENT_KEY)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Use a different email" }));
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe("false");
    expect(newsletterSaveMock).not.toHaveBeenCalled();
  });
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

it("keeps one page heading and a localized calculator link without campaign copy", () => {
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

it("renders the shared mobile header before one full-width login main", async () => {
  const { container } = render(await AuthLayout({ children: <LoginPage /> }));
  const main = screen.getByRole("main");
  expect(main.id).toBe("main-content");
  expect(main.tabIndex).toBe(-1);
  expect(main.parentElement).toBe(container);
  expect(main.className).not.toContain("max-w");
  expect(screen.getByRole("banner").parentElement?.className).toBe("lg:hidden");
  expect(screen.getAllByRole("link", { name: "BikeFitBoost" })).toHaveLength(2);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
});

it.each(["en", "nl"].flatMap((locale) => ["", "?src=dashboard", "?src=guide&utm_source=email"]
  .map((query) => [locale, query])))
("preserves %s login%s metadata without hreflang", async (locale, query) => {
  pathname = `/${locale}/login${query}`;
  const metadata = await generateMetadata();
  expect(metadata.title).toBe(locale === "nl" ? "Inloggen | BikeFitBoost" : "Sign In | BikeFitBoost");
  expect(metadata.robots).toEqual({ index: false, follow: true });
  expect(metadata.alternates?.canonical).toBe(`https://bikefitboost.com/${locale}/login`);
  expect(metadata.alternates).toEqual({ canonical: `https://bikefitboost.com/${locale}/login` });
  expect(metadata.alternates?.languages).toBeUndefined();
});
