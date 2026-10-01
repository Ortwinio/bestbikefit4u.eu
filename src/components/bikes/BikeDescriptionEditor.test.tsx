// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Id } from "../../../convex/_generated/dataModel";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { BikeDescriptionEditor } from "./BikeDescriptionEditor";
const mocks = vi.hoisted(() => ({ update: vi.fn(), generate: vi.fn() }));
vi.mock("convex/react", () => ({ useMutation: () => mocks.update, useAction: () => mocks.generate }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: "nl", messages: getDashboardMessages("nl") }),
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const tick = async (ms = 800) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
it("flushes pending manual text before generation and does not overwrite the generated source", async () => {
  let finish!: () => void;
  mocks.update.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  mocks.generate.mockResolvedValue({ description: "Gemaakt voor deze fiets", source: "generated" });
  render(<BikeDescriptionEditor bikeId={"bike" as Id<"bikes">} initialDescription="Oud" />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mijn tekst" } });
  fireEvent.click(screen.getByRole("button", { name: /opnieuw|regener/i }));
  await tick(0);
  expect(mocks.generate).not.toHaveBeenCalled();
  await act(async () => {
    finish();
  });
  await tick();
  expect(mocks.update).toHaveBeenCalledTimes(1);
  expect(mocks.update).toHaveBeenCalledWith({
    bikeId: "bike",
    description: "Mijn tekst",
    descriptionSource: "manual",
  });
  expect(mocks.generate).toHaveBeenCalledWith({ bikeId: "bike", locale: "nl" });
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Gemaakt voor deze fiets");
});
it("keeps a failed Dutch edit and saves an empty string when cleared", async () => {
  mocks.update.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
  const view = render(<BikeDescriptionEditor bikeId={"bike" as Id<"bikes">} initialDescription="Oud" />);
  const field = screen.getByRole("textbox", { name: "Fietsbeschrijving" });
  expect(field.getAttribute("aria-label")).toBe("Fietsbeschrijving");
  fireEvent.change(field, { target: { value: "Niet verliezen" } });
  await tick();
  view.rerender(<BikeDescriptionEditor bikeId={"bike" as Id<"bikes">} initialDescription="Server echo" />);
  expect((field as HTMLTextAreaElement).value).toBe("Niet verliezen");
  expect(screen.getByRole("status").textContent).toContain("Niet opgeslagen");
  fireEvent.click(screen.getByRole("button", { name: "Opnieuw proberen" }));
  await tick(0);
  fireEvent.change(field, { target: { value: "" } });
  await tick();
  expect(mocks.update).toHaveBeenLastCalledWith({
    bikeId: "bike",
    description: "",
    descriptionSource: "manual",
  });
});
