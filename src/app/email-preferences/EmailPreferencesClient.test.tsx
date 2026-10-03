/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { ButtonHTMLAttributes } from "react";
import { EmailPreferencesClient } from "./EmailPreferencesClient";

const mocks = vi.hoisted(() => ({
  view: vi.fn(), save: vi.fn(), unsubscribe: vi.fn(), accountSave: vi.fn(),
  log: vi.fn(),
  account: null as null | undefined | { service: boolean; marketing: boolean; newsletter?: boolean },
}));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => mocks.log }));
vi.mock("convex/react", () => ({
  useAction: (reference: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(reference);
    return name.endsWith(":view") ? mocks.view : name.endsWith(":save") ? mocks.save : mocks.unsubscribe;
  },
  useMutation: () => mocks.accountSave,
  useQuery: (_reference: unknown, args: unknown) => args === "skip" ? undefined : mocks.account,
}));
vi.mock("@/components/ui", async () => ({
  CheckboxGroup: (await import("@/components/ui/CheckboxGroup")).CheckboxGroup,
  Selectable: (await import("@/components/ui/Selectable")).Selectable,
  Button: ({ isLoading, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) => <button aria-busy={isLoading} {...props} />,
}));

beforeEach(() => {
  vi.resetAllMocks();
  window.history.replaceState(null, "", "/en/email-preferences");
  mocks.account = null;
  mocks.view.mockResolvedValue({ purpose: "preferences", preferences: { service: true, marketing: true } });
  mocks.save.mockResolvedValue({ service: false, marketing: false, newsletter: false, newsletterGranted: false });
  mocks.accountSave.mockResolvedValue({ service: true, marketing: true, newsletter: false, newsletterGranted: false });
});
afterEach(cleanup);

describe("email preferences page", () => {
  it.each(["nl", "en"] as const)("views and saves both categories in %s only after submission", async (locale) => {
    window.location.hash = "token=preferences-token";
    render(<EmailPreferencesClient locale={locale} />);
    const checkboxes = await screen.findAllByRole("checkbox");
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByRole("button", { name: locale === "nl" ? "Voorkeuren opslaan" : "Save preferences" }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ token: "preferences-token", service: false, marketing: false }));
    expect(await screen.findByRole("status")).toBeTruthy();
  });

  it("never unsubscribes on load and shows only the signed category confirmation", async () => {
    window.location.hash = "token=unsubscribe-token";
    mocks.view.mockResolvedValue({ purpose: "unsubscribe", category: "marketing" });
    render(<EmailPreferencesClient locale="en" />);
    const confirm = await screen.findByRole("button", { name: "Unsubscribe" });
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText("News and offers")).toBeTruthy();
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
    fireEvent.click(confirm);
    await waitFor(() => expect(mocks.unsubscribe).toHaveBeenCalledWith({ token: "unsubscribe-token" }));
  });

  it("supports authenticated preferences without an email token", async () => {
    mocks.account = { service: false, marketing: true };
    render(<EmailPreferencesClient locale="nl" />);
    const checkboxes = await screen.findAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    fireEvent.click(screen.getByRole("button", { name: "Voorkeuren opslaan" }));
    await waitFor(() => expect(mocks.accountSave).toHaveBeenCalledWith({ service: true, marketing: true }));
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("offers login without an account and hides controls for invalid links", async () => {
    render(<EmailPreferencesClient locale="en" />);
    expect(await screen.findByText("Sign in to manage your email preferences.")).toBeTruthy();
    cleanup();
    window.location.hash = "token=invalid";
    mocks.view.mockRejectedValue(new Error("expired"));
    render(<EmailPreferencesClient locale="nl" />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByRole("link", { name: "Inloggen" }).getAttribute("href")).toBe("/nl/login");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("keeps newsletter unchecked after loading an old preference object without writing", async () => {
    mocks.account = undefined;
    const view = render(<EmailPreferencesClient locale="en" />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    mocks.account = { service: true, marketing: true };
    view.rerender(<EmailPreferencesClient locale="en" />);
    const newsletter = await screen.findByRole("checkbox", { name: /Send me the newsletter/ });
    expect(newsletter.getAttribute("aria-checked")).toBe("false");
    expect(mocks.accountSave).not.toHaveBeenCalled();
  });
  it.each([false, true])("saves explicit newsletter grant for token=%s and logs no identifiers", async token => {
    if (token) window.location.hash = "token=private-token";
    else mocks.account = { service: true, marketing: true, newsletter: false };
    const save = token ? mocks.save : mocks.accountSave;
    save.mockResolvedValue({ service: true, marketing: true, newsletter: true, newsletterGranted: true });
    render(<EmailPreferencesClient locale="en" />);
    fireEvent.click(await screen.findByRole("checkbox", { name: /Send me the newsletter/ }));
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await screen.findByText("Your email preferences have been saved.");
    expect(save).toHaveBeenCalledWith({ ...(token ? { token: "private-token" } : {}), service: true, marketing: true, newsletter: true, consent: { requestId: expect.stringMatching(/^[a-zA-Z0-9_-]{8,128}$/), locale: "en", wordingVersion: "newsletter-v1" } });
    expect(mocks.log).toHaveBeenCalledExactlyOnceWith({ eventType: "newsletter_opt_in", locale: "en", pagePath: "/en/email-preferences" });
  });
  it("reuses consent on retry, honors current replay value and omits untouched newsletter on later saves", async () => {
    mocks.account = { service: true, marketing: true, newsletter: false };
    mocks.accountSave.mockRejectedValueOnce(new Error("offline"));
    render(<EmailPreferencesClient locale="en" />);
    fireEvent.click(await screen.findByRole("checkbox", { name: /Send me the newsletter/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await screen.findByText("Your email preferences have been saved.");
    expect(mocks.accountSave.mock.calls[1][0].consent.requestId).toBe(mocks.accountSave.mock.calls[0][0].consent.requestId);
    expect(screen.getByRole("checkbox", { name: /Send me the newsletter/ }).getAttribute("aria-checked")).toBe("false");
    expect(mocks.log).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await waitFor(() => expect(mocks.accountSave).toHaveBeenLastCalledWith({ service: true, marketing: true }));
  });
  it("handles newsletter token unsubscribe only after explicit confirmation", async () => {
    window.location.hash = "token=newsletter-token";
    mocks.view.mockResolvedValue({ purpose: "unsubscribe", category: "newsletter" });
    render(<EmailPreferencesClient locale="nl" />);
    const button = await screen.findByRole("button", { name: "Afmelden" });
    expect(screen.getByText("Stuur mij de nieuwsbrief")).toBeTruthy();
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
    fireEvent.click(button);
    await waitFor(() => expect(mocks.unsubscribe).toHaveBeenCalledExactlyOnceWith({ token: "newsletter-token" }));
    expect(mocks.log).not.toHaveBeenCalled();
  });
});
