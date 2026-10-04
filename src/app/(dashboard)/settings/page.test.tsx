/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import SettingsPage from "./page";
import { subscriptionCopy } from "@/i18n/account/subscription";
const state = vi.hoisted(() => ({
  loading: false,
  locale: "nl" as "nl" | "en",
  queries: vi.fn(),
  actions: vi.fn(),
  subscriptionLoading: false,
  product: "single",
  renewed: false,
  cancelled: false,
  appointmentAvailable: false,
  eligibleForUpgrade: false,
  eligibleForPersonalFit: false,
  subscriptionQuery: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  signOut: vi.fn(),
  push: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: state.push, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@convex-dev/auth/react", () => ({ useAuthActions: () => ({ signOut: state.signOut }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: state.locale,
    messages: state.locale === "nl" ? nl.dashboard : en.dashboard,
    languageSwitchLabels: nl.common,
  }),
}));
vi.mock("@/components/ui", async (load) => ({
  ...(await load<typeof import("@/components/ui")>()),
  useToast: () => state.toast,
}));
vi.mock("@/components/profile/ProfilePhotoUpload", () => ({ ProfilePhotoUpload: () => <div /> }));
vi.mock("@/components/settings/IPhoneAppInstallCard", () => ({
  IPhoneAppInstallCard: () => <div />,
}));
vi.mock("@/components/layout/LanguageSwitch", () => ({ LanguageSwitch: () => <div /> }));
vi.mock("@/components/ui/ThemeToggle", () => ({ ThemeToggle: () => <div /> }));
vi.mock("convex/react", () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => {
    state.queries(getFunctionName(reference));
    if (getFunctionName(reference) === "pricing/queries:getSubscription") {
      state.subscriptionQuery();
      return state.subscriptionLoading ? undefined : {
        access: { productId: state.product, expiresAt: Date.UTC(2027, 0, 3), eligibleForUpgrade: state.eligibleForUpgrade, eligibleForPersonalFit: state.eligibleForPersonalFit, appointmentAvailable: state.appointmentAvailable, enforced: process.env.NEXT_PUBLIC_PAID_ACCESS_ENFORCED === "true" },
        entitlements: state.product === "free" ? [] : [{ productId: state.product, status: "active", startsAt: Date.UTC(2026, 9, 3), expiresAt: Date.UTC(2027, 0, 3), bikeId: "test-bike", renewed: state.renewed, cancelled: state.cancelled, periodPriceCents: 2150 }],
      };
    }
    if (getFunctionName(reference) === "bikes/queries:get") return { name: "Canyon Endurace" };
    if (getFunctionName(reference).includes("getCurrentUser"))
      return state.loading
        ? undefined
        : {
            _id: "test-user",
            displayName: "Sanne",
            email: "fixture@example.invalid",
            tier: "free",
          };
    throw new Error(`Unexpected query: ${getFunctionName(reference)}`);
  },
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference).includes("deleteAccount") ? state.remove : state.update,
  useAction: state.actions,
}));
beforeEach(() => {
  state.loading = false;
  state.locale = "nl";
  state.queries.mockClear();
  state.actions.mockClear();
  state.subscriptionLoading = false;
  state.product = "single";
  state.renewed = false;
  state.cancelled = false;
  state.appointmentAvailable = false;
  state.eligibleForUpgrade = false;
  state.eligibleForPersonalFit = false;
  state.subscriptionQuery.mockClear();
  vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "false");
  state.update.mockReset().mockResolvedValue(null);
  state.remove.mockReset().mockResolvedValue(null);
  state.push.mockReset();
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("account settings", () => {
  it.each(["nl", "en"] as const)("uses server eligibility for upgrade and appointment actions in %s", (locale) => {
    state.locale = locale;
    state.product = "free";
    const copy = subscriptionCopy[locale];
    const view = render(<SettingsPage />);
    expect(screen.queryByRole("link", { name: copy.upgrade })).toBeNull();
    expect(screen.queryByRole("link", { name: copy.buyAppointment })).toBeNull();
    state.eligibleForUpgrade = true;
    state.eligibleForPersonalFit = true;
    view.rerender(<SettingsPage />);
    expect(screen.getByRole("link", { name: copy.upgrade }).getAttribute("href")).toBe(`/${locale}/checkout?product=annual`);
    expect(screen.getByRole("link", { name: copy.buyAppointment }).getAttribute("href")).toBe(`/${locale}/checkout?product=personal_fit_standalone`);
    expect(screen.queryByRole("link", { name: copy.planAppointment })).toBeNull();
    state.eligibleForUpgrade = false;
    state.appointmentAvailable = true;
    view.rerender(<SettingsPage />);
    expect(screen.queryByRole("link", { name: copy.upgrade })).toBeNull();
    expect(screen.queryByRole("link", { name: copy.buyAppointment })).toBeNull();
    expect(screen.getByRole("link", { name: copy.planAppointment }).getAttribute("href")).toBe(`/${locale}/checkout?appointment=1`);
    expect(state.update).not.toHaveBeenCalled();
  });

  it("presents an annual upgrade as annual access with gift navigation", () => {
    state.product = "annual_upgrade";
    render(<SettingsPage />);
    expect(screen.getByText(subscriptionCopy.nl.annual)).toBeTruthy();
    expect(screen.getByRole("link", { name: subscriptionCopy.nl.giveGift })).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.nl.started).nextElementSibling?.textContent).toBe("3 oktober 2026");
  });

  it.each(["true", "false"])("links gifts only for actual annual plans with enforcement %s", (flag) => {
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", flag);
    state.product = "free";
    const view = render(<SettingsPage />);
    expect(screen.queryByRole("link", { name: subscriptionCopy.nl.giveGift })).toBeNull();
    state.product = "single";
    view.rerender(<SettingsPage />);
    expect(screen.queryByRole("link", { name: subscriptionCopy.nl.giveGift })).toBeNull();
    state.product = "annual";
    view.rerender(<SettingsPage />);
    expect(screen.getByRole("link", { name: subscriptionCopy.nl.giveGift }).getAttribute("href")).toBe("/nl/gifts");
  });

  it.each(["nl", "en"] as const)("has no Strava UI or integration calls in %s", (locale) => {
    state.locale = locale;
    const { container } = render(<SettingsPage />);
    expect(container.textContent).not.toMatch(/strava/i);
    expect(state.queries.mock.calls.flat()).toContain("users/queries:getCurrentUser");
    expect(state.queries.mock.calls.flat().join(" ")).not.toMatch(/strava/i);
    expect(state.actions).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveProperty("value", "Sanne");
    expect(container.querySelector(`a[href="/${locale}/privacy"]`)).toBeTruthy();
  });

  it("uses A's appointment availability and hides the link after the credit is used", () => {
    state.product = "annual_personal";
    state.appointmentAvailable = true;
    const view = render(<SettingsPage />);
    expect(screen.getByRole("link", { name: "Plan je afspraak" }).getAttribute("href")).toBe("/nl/checkout?appointment=1");
    state.appointmentAvailable = false;
    view.rerender(<SettingsPage />);
    expect(screen.queryByRole("link", { name: "Plan je afspraak" })).toBeNull();
    expect(state.update).not.toHaveBeenCalled();
  });
  it("shows the new free overview and full access copy with enforcement OFF", () => {
    state.product = "free";
    render(<SettingsPage />);
    expect(screen.getByText(subscriptionCopy.nl.freeOpenDescription)).toBeTruthy();
    expect(screen.queryByText(/80%/)).toBeNull();
    expect(screen.getByRole("link", { name: "Bekijk prijzen" })).toBeTruthy();
    expect(state.subscriptionQuery).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: nl.dashboard.settings.billing.manageCta })).toBeNull();
  });
  it.each(["true", "false"])("shows A's overview and preserves other settings with enforcement %s", (flag) => {
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", flag);
    render(<SettingsPage />);
    expect(screen.getByText("Losse meting")).toBeTruthy();
    expect(screen.getByText("Canyon Endurace")).toBeTruthy();
    expect(screen.getByText("3 januari 2027")).toBeTruthy();
    expect(screen.queryByText("Betalingen tijdelijk gepauzeerd")).toBeNull();
    expect(screen.getByRole("textbox", { name: nl.dashboard.settings.account.displayNameLabel })).toBeTruthy();
    expect(screen.getByRole("button", { name: nl.dashboard.profile.dangerZone.deleteAccount })).toBeTruthy();
  });
  it("consumes authoritative renewed and cancelled metadata without relying on legacy tier", () => {
    state.product = "annual";
    state.renewed = true;
    state.cancelled = true;
    render(<SettingsPage />);
    expect(screen.getByText("Jaarabonnement · Opgezegd")).toBeTruthy();
    expect(screen.getByText(/21,50/)).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.nl.cancelledOpenDescription)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Abonnement opzeggen" })).toBeNull();
  });
  it("shows the free access limits when enforcement is ON", () => {
    state.product = "free";
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "true");
    render(<SettingsPage />);
    expect(screen.getByText(subscriptionCopy.nl.freeDescription)).toBeTruthy();
  });
  it("does not show a free plan while the enabled subscription query loads", () => {
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "true");
    state.subscriptionLoading = true;
    render(<SettingsPage />);
    expect(screen.getByText("Je abonnement wordt geladen…")).toBeTruthy();
    expect(screen.queryByText("Je gebruikt een gratis account.", { exact: false })).toBeNull();
  });
  it("shows Dutch validation errors returned by the shared error reporter", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
    state.update.mockRejectedValueOnce(new Error("Invalid display name"));
    render(<SettingsPage />);
    const field = screen.getByRole("textbox", { name: nl.dashboard.settings.account.displayNameLabel });
    fireEvent.change(field, { target: { value: "New name" } });
    fireEvent.blur(field);
    expect(await screen.findByText("Niet opgeslagen")).toBeTruthy();
    expect(field).toHaveProperty("value", "New name");
    fireEvent.click(screen.getByRole("button", { name: "Opnieuw proberen" }));
    expect(await screen.findByText("Opgeslagen")).toBeTruthy();
    expect(screen.queryByText("Please check your input and try again.")).toBeNull();
    logged.mockRestore();
  });
  it("uses a real loading state instead of showing a free account", () => {
    state.loading = true;
    render(<SettingsPage />);
    expect(screen.getByText("Je instellingen worden geladen…")).toBeTruthy();
    expect(screen.queryByText("Betalingen tijdelijk gepauzeerd")).toBeNull();
  });
  it("saves a display name with the existing mutation alongside the new overview", async () => {
    render(<SettingsPage />);
    fireEvent.change(
      screen.getByRole("textbox", { name: nl.dashboard.settings.account.displayNameLabel }),
      {
        target: { value: "New rider name" },
      },
    );
    expect(screen.queryByRole("button", { name: nl.dashboard.settings.account.saveDisplayName })).toBeNull();
    fireEvent.blur(screen.getByRole("textbox", { name: nl.dashboard.settings.account.displayNameLabel }));
    await waitFor(() =>
      expect(state.update).toHaveBeenCalledWith({ displayName: "New rider name" }),
    );
    expect(screen.queryByText("Betalingen tijdelijk gepauzeerd")).toBeNull();
    expect(screen.getByText("Losse meting")).toBeTruthy();
    expect(state.subscriptionQuery).toHaveBeenCalled();
    expect(screen.queryByText(nl.dashboard.settings.account.upgradeCta)).toBeNull();
  });
  it("requires the existing typed confirmation before deleting", async () => {
    render(<SettingsPage />);
    fireEvent.click(
      screen.getByRole("button", { name: nl.dashboard.profile.dangerZone.deleteAccount }),
    );
    const confirm = screen.getByRole("button", {
      name: nl.dashboard.profile.dangerZone.deleteConfirmCta,
    });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    expect(state.remove).not.toHaveBeenCalled();
    fireEvent.change(
      screen.getByRole("textbox", {
        name: nl.dashboard.profile.dangerZone.deleteConfirmInputLabel,
      }),
      { target: { value: nl.dashboard.profile.dangerZone.deleteConfirmWord } },
    );
    fireEvent.click(confirm);
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith({}));
    await waitFor(() => expect(state.push).toHaveBeenCalledWith("/nl"));
  });
});
