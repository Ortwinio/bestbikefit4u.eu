// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useActionMock, pushMock, toastSuccessMock } = vi.hoisted(() => ({
  useActionMock: vi.fn(),
  pushMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useAction: useActionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui", async () => {
  const actual = await vi.importActual<typeof import("@/components/ui")>("@/components/ui");
  return {
    ...actual,
    useToast: () => ({
      success: toastSuccessMock,
    }),
  };
});

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: "en",
    messages: {
      bikeTypes: {
        road: { label: "Road", description: "" },
        gravel: { label: "Gravel", description: "" },
        mountain: { label: "Mountain", description: "" },
        hybrid: { label: "Hybrid", description: "" },
        tt_triathlon: { label: "TT / Triathlon", description: "" },
        cyclocross: { label: "Cyclocross", description: "" },
        touring: { label: "Touring", description: "" },
        city: { label: "City", description: "" },
      },
      bikeForm: {
        marktplaatsImport: {
          title: "Import a bike from Marktplaats",
          description: "Preview and save an imported bike draft.",
          entryTitle: "Paste a Marktplaats advert URL",
          entryDescription: "The advert is parsed on the server.",
          previewTitle: "Review imported draft",
          previewDescription: "Check the parsed fields before saving.",
          findingsTitle: "What we found in this advert",
          findingsDescription: "Review the structured findings.",
          findingsCount: "{count} findings",
          findingDescriptionSummary: "Imported description available ({characters} characters).",
          findingPhotoSummary: "{count} advert photos found.",
          findingLabels: {
            name: "Bike name",
            brand: "Brand",
            model: "Model",
            bikeType: "Bike type",
            description: "Description",
            photos: "Photos",
          },
          photosTitle: "Imported photos",
          photosDescription: "Select the advert photos you want to keep.",
          photoVerificationTitle: "Photo verification",
          photoCountSummary: "{selected} of {total} selected",
          primaryPhotoTitle: "Primary preview image",
          primaryPhotoDescription: "Use the thumbnail strip to inspect the advert photos.",
          photoActiveBadge: "Active preview",
          photoPreviewBadge: "View photo",
          photosEmptyTitle: "No importable photos found",
          photosEmptyDescription: "You can still save without photos.",
          photoFallbackLabel: "Advert photo",
          photoSelected: "Selected for import",
          photoDeselected: "Not selected",
          photoBadgeSelected: "Selected",
          photoBadgeOptional: "Optional",
          nameHint: "The bike name is fully editable.",
          warningsTitle: "Needs review",
          confidenceBadge: "{level} confidence",
          success: "Bike draft created from Marktplaats.",
          loading: {
            preview: "Parsing Marktplaats advert...",
          },
          actions: {
            preview: "Preview import",
            previewLoading: "Loading preview...",
            save: "Save bike draft",
            saveLoading: "Saving bike...",
            cancel: "Back to garage",
            startOver: "Start over",
          },
          fields: {
            url: {
              label: "Marktplaats URL",
              placeholder: "https://www.marktplaats.nl/...",
            },
            name: {
              label: "Bike name",
              placeholder: "Choose the rider-facing bike name",
            },
            brand: {
              label: "Brand",
              placeholder: "Confirm the brand",
            },
            model: {
              label: "Model",
              placeholder: "Confirm the model",
            },
            bikeType: {
              label: "Bike type",
            },
            description: {
              label: "Description",
              placeholder: "Imported advert text appears here and stays editable.",
            },
          },
          errors: {
            title: "Import needs attention",
            unsupportedUrl: "Use a valid Marktplaats advert URL.",
            previewFailed: "The advert preview could not be loaded.",
            saveFailed: "The bike draft could not be saved.",
            backendUnavailable: "Backend unavailable.",
          },
        },
      },
    },
    languageSwitchLabels: {},
  }),
}));

import { MarktplaatsBikeImportFlow } from "./MarktplaatsBikeImportFlow";

describe("MarktplaatsBikeImportFlow", () => {
  it("renders findings and photo verification after previewing an advert", async () => {
    const previewAction = vi.fn(async () => ({
      importId: "import-1",
      advertTitle: "Canyon Endurace CF 7",
      description: "Full imported advert text for review.",
      candidateBrand: { value: "Canyon", confidence: "high" },
      candidateModel: { value: "Endurace CF 7", confidence: "medium" },
      candidateBikeType: { value: "road", confidence: "medium" },
      warnings: ["Model needs review."],
      photos: [
        { url: "https://img/1.jpg", selected: true },
        { url: "https://img/2.jpg", selected: false },
      ],
    }));
    const saveAction = vi.fn();
    useActionMock.mockReset();
    useActionMock.mockImplementationOnce(() => previewAction);
    useActionMock.mockImplementationOnce(() => saveAction);

    render(<MarktplaatsBikeImportFlow />);

    fireEvent.change(screen.getByLabelText("Marktplaats URL"), {
      target: { value: "https://www.marktplaats.nl/v/fietsen-en-brommers/racefietsen/m123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview import" }));

    await waitFor(() =>
      expect(screen.getByText("What we found in this advert")).toBeInTheDocument()
    );

    expect(screen.getByText("Photo verification")).toBeInTheDocument();
    expect(screen.getByText("Primary preview image")).toBeInTheDocument();
    expect(screen.getByText("2 advert photos found.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Full imported advert text for review.")).toBeInTheDocument();
    expect(screen.getByText("2 of 2 selected")).not.toBeInTheDocument();
    expect(screen.getByText("1 of 2 selected")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /View photo|Active preview/ })[1]);

    await waitFor(() =>
      expect(screen.getAllByText("Active preview").length).toBeGreaterThan(0)
    );
  });

  it("shows an explicit empty photo state when no photos are available", async () => {
    const previewAction = vi.fn(async () => ({
      importId: "import-2",
      advertTitle: "No photo bike",
      description: "Imported body",
      candidateBikeType: { value: "road", confidence: "low" },
      photos: [],
    }));
    const saveAction = vi.fn();
    useActionMock.mockReset();
    useActionMock.mockImplementationOnce(() => previewAction);
    useActionMock.mockImplementationOnce(() => saveAction);

    render(<MarktplaatsBikeImportFlow />);

    fireEvent.change(screen.getByLabelText("Marktplaats URL"), {
      target: { value: "https://www.marktplaats.nl/v/fietsen-en-brommers/racefietsen/m456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview import" }));

    await waitFor(() =>
      expect(screen.getByText("No importable photos found")).toBeInTheDocument()
    );
    expect(screen.getByText("You can still save without photos.")).toBeInTheDocument();
  });
});
