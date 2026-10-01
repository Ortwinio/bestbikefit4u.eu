/* @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "@/i18n/config";
import { DeleteBikeAction } from "./DeleteBikeAction";

const { removeBike, successToast, replace, loadMore } = vi.hoisted(() => ({
  removeBike: vi.fn(), successToast: vi.fn(), replace: vi.fn(), loadMore: vi.fn(),
}));
let locale: Locale = "nl";
let status = "Exhausted";
let results = ["session-1", "session-2", "session-3"];

vi.mock("convex/react", () => ({
  useMutation: () => removeBike,
  usePaginatedQuery: (_query: unknown, args: unknown) => args === "skip"
    ? { results: [], status: "LoadingFirstPage", loadMore }
    : { results, status, loadMore },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale }) }));
vi.mock("@/components/ui", async () => ({
  ...await vi.importActual<typeof import("@/components/ui")>("@/components/ui"),
  useToast: () => ({ success: successToast }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  locale = "nl";
  status = "Exhausted";
  results = ["session-1", "session-2", "session-3"];
});
afterEach(cleanup);

async function openDialog(onPendingChange?: (pending: boolean) => void) {
  render(<DeleteBikeAction bikeId="bike-a" bikeName="Mijn gravelbike" onPendingChange={onPendingChange} />);
  fireEvent.click(screen.getByRole("button", { name: locale === "nl" ? "Verwijder fiets" : "Delete bike" }));
  return screen.findByRole("dialog");
}

describe("DeleteBikeAction", () => {
  it.each(["nl", "en"] as const)("shows complete deletion scope and exact-name confirmation in %s", async (language) => {
    locale = language;
    const dialog = await openDialog();
    expect(within(dialog).getByText(language === "nl"
      ? "3 fitsessies met alle adviezen en PDF-rapporten."
      : "3 fit sessions with all advice and PDF reports.")).toBeTruthy();
    expect(within(dialog).getByText(language === "nl"
      ? "Dit kan niet ongedaan worden gemaakt." : "This cannot be undone.")).toBeTruthy();
    expect(within(dialog).getByText(language === "nl"
      ? "De ritgeschiedenis en je feedback over ritten op deze fiets."
      : "Cycling activity history and your ride feedback for this bike.")).toBeTruthy();
    const confirm = within(dialog).getByRole("button", {
      name: language === "nl" ? "Definitief verwijderen" : "Permanently delete",
    });
    expect(confirm).toHaveProperty("disabled", true);
    const input = within(dialog).getByRole("textbox");
    fireEvent.change(input, { target: { value: "mijn gravelbike" } });
    expect(confirm).toHaveProperty("disabled", true);
    fireEvent.change(input, { target: { value: "Mijn gravelbike " } });
    expect(confirm).toHaveProperty("disabled", true);
    fireEvent.change(input, { target: { value: "Mijn gravelbike" } });
    expect(confirm).toHaveProperty("disabled", false);
    fireEvent.click(confirm);
    await waitFor(() => expect(removeBike).toHaveBeenCalledWith({ bikeId: "bike-a", confirmName: "Mijn gravelbike" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith(`/${language}/bikes`));
    expect(successToast).toHaveBeenCalledWith({ description: language === "nl" ? "Fiets verwijderd" : "Bike deleted" });
  });

  it("loads every session page and does not present a partial count as final", async () => {
    status = "CanLoadMore";
    const dialog = await openDialog();
    expect(loadMore).toHaveBeenCalledWith(100);
    expect(within(dialog).getByText("Aantal fitsessies ophalen…")).toBeTruthy();
    expect(within(dialog).queryByText("3 fitsessies met alle adviezen en PDF-rapporten.")).toBeNull();
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "Mijn gravelbike" } });
    expect(within(dialog).getByRole("button", { name: "Definitief verwijderen" })).toHaveProperty("disabled", true);
  });

  it("shows a real zero count and keeps the bike on failure with a localized retry message", async () => {
    results = [];
    removeBike.mockRejectedValueOnce(new Error("Private backend error"));
    const onPendingChange = vi.fn();
    const dialog = await openDialog(onPendingChange);
    expect(within(dialog).getByText("0 fitsessies met alle adviezen en PDF-rapporten.")).toBeTruthy();
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "Mijn gravelbike" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Definitief verwijderen" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Je fiets kon niet worden verwijderd. Probeer het opnieuw.");
    expect(replace).not.toHaveBeenCalled();
    expect(successToast).not.toHaveBeenCalled();
    expect(onPendingChange.mock.calls).toEqual([[true], [false]]);
    expect(within(dialog).getByRole("button", { name: "Definitief verwijderen" })).toHaveProperty("disabled", false);
  });

  it("prevents duplicate submissions and cancellation while pending", async () => {
    let complete!: () => void;
    removeBike.mockImplementationOnce(() => new Promise<void>((resolve) => { complete = resolve; }));
    const onPendingChange = vi.fn();
    const dialog = await openDialog(onPendingChange);
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "Mijn gravelbike" } });
    const confirm = within(dialog).getByRole("button", { name: "Definitief verwijderen" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(removeBike).toHaveBeenCalledTimes(1);
    expect(within(dialog).getByText("3 fitsessies met alle adviezen en PDF-rapporten.")).toBeTruthy();
    expect(within(dialog).queryByText("Aantal fitsessies ophalen…")).toBeNull();
    expect(confirm).toHaveProperty("disabled", true);
    expect(within(dialog).getByRole("button", { name: "Annuleren" })).toHaveProperty("disabled", true);
    await act(async () => complete());
    expect(onPendingChange.mock.calls).toEqual([[true]]);
  });

  it("focuses confirmation, closes on Escape and resets the typed name", async () => {
    const dialog = await openDialog();
    const input = within(dialog).getByRole("textbox");
    await waitFor(() => expect(document.activeElement).toBe(input));
    fireEvent.change(input, { target: { value: "Mijn gravelbike" } });
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const trigger = screen.getByRole("button", { name: "Verwijder fiets" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    fireEvent.click(trigger);
    expect(within(await screen.findByRole("dialog")).getByRole("textbox")).toHaveProperty("value", "");
  });
});
