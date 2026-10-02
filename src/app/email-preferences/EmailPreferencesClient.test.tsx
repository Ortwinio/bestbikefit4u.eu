/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { ButtonHTMLAttributes } from "react";
import { EmailPreferencesClient } from "./EmailPreferencesClient";

const mocks = vi.hoisted(() => ({
  view: vi.fn(), save: vi.fn(), unsubscribe: vi.fn(), accountSave: vi.fn(),
  account: null as null | { service: boolean; marketing: boolean },
}));
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
});
