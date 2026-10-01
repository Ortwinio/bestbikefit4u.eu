/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getBikeLanguageMessages } from "@/i18n/account/bikesLanguage";
import { BikePassportImportFlow } from "./BikePassportImportFlow";

const state = vi.hoisted(() => ({
  locale: "nl" as "nl" | "en", preview: vi.fn(), importBike: vi.fn(), push: vi.fn(), success: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock("convex/react", () => ({ useAction: () => state.preview, useMutation: () => state.importBike }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("@/components/ui", async () => ({
  ...await vi.importActual<typeof import("@/components/ui")>("@/components/ui"),
  useToast: () => ({ success: state.success }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  state.preview.mockResolvedValue({
    status: "available", bikePassportId: "BBF-AB12-CD34", copyIncludesPhotos: false,
    bike: { name: "Shared bike", bikeType: "gravel", description: "Shared description" },
  });
  state.importBike.mockResolvedValue({ bikeId: "new-bike" });
});
afterEach(cleanup);

describe("bike passport import", () => {
  it.each(["nl", "en"] as const)("keeps preview, editable description and import working in %s", async (locale) => {
    state.locale = locale;
    const copy = getBikeLanguageMessages(locale, getDashboardMessages(locale)).bikeForm.passportImport;
    render(<BikePassportImportFlow />);
    fireEvent.change(screen.getByRole("textbox", { name: copy.fields.passportId.label }), {
      target: { value: "BBF-AB12-CD34" },
    });
    fireEvent.submit(screen.getByRole("button", { name: copy.actions.preview }).closest("form")!);
    await waitFor(() => expect(state.preview).toHaveBeenCalledWith({ bikePassportId: "BBF-AB12-CD34" }));
    const description = await screen.findByRole("textbox", { name: locale === "nl" ? "Beschrijving" : "Description" });
    expect(description).toHaveProperty("value", "Shared description");
    expect(description).toHaveProperty("placeholder", locale === "nl"
      ? "De gedeelde beschrijving staat hier. Je kunt die aanpassen voor je eigen fiets."
      : "The shared description appears here. You can edit it for your own bike.");
    fireEvent.change(description, { target: { value: "My own description" } });
    fireEvent.click(screen.getByRole("button", { name: copy.actions.import }));
    await waitFor(() => expect(state.importBike).toHaveBeenCalledWith({
      bikePassportId: "BBF-AB12-CD34", name: "Shared bike", bikeType: "gravel",
      brand: undefined, model: undefined, description: "My own description",
    }));
    expect(state.preview).toHaveBeenCalledWith({ bikePassportId: "BBF-AB12-CD34" });
    await waitFor(() => expect(state.push).toHaveBeenCalledWith(`/${locale}/bikes/new-bike`));
  });
});
