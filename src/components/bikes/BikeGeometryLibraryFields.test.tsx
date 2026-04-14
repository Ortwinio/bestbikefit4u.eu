/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BikeGeometryLibraryFields } from "./BikeGeometryLibraryFields";
import {
  createBikeGeometryFallbackState,
  type BikeGeometryFallbackState,
} from "./bikeFormGeometry";

const useQueryMock = vi.mocked(useQuery);

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../../../convex/_generated/api", () => ({
  api: {
    geometry: {
      queries: {
        listBrandsForRider: "listBrandsForRider",
        listModelsForRiderBrand: "listModelsForRiderBrand",
        listSizeRecordsForRiderModel: "listSizeRecordsForRiderModel",
        getGeometryRecordPreview: "getGeometryRecordPreview",
        getGeometryRecordSelectionForRider: "getGeometryRecordSelectionForRider",
      },
    },
  },
}));

vi.mock("@/lib/analytics/marketing", () => ({
  pushDataLayerEvent: vi.fn(),
}));

vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    ...props
  }: {
    children?: ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
  Input: ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (event: { target: { value: string } }) => void;
    placeholder?: string;
  }) => (
    <label>
      <span>{label}</span>
      <input
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={onChange as never}
      />
    </label>
  ),
}));

const messages = {
  common: { back: "Back" },
  bikeForm: {
    fields: {
      brand: { label: "Brand", placeholder: "Brand" },
      model: { label: "Model", placeholder: "Model" },
      geometryLink: {
        title: "Link bike geometry",
        description: "Pick brand, model, year, and size.",
        loadingBrands: "Loading brands",
        loadingModels: "Loading models",
        noBrands: "No brands",
        selectBrandFirst: "Pick a brand first",
        selectModelFirst: "Choose the right model",
        noModels: "No models",
        selectionSummary: "Selected standard bike identity",
        selectionSummaryEmpty: "No standard geometry-library path selected yet.",
        standardBrand: {
          label: "Standard brand",
          placeholder: "Choose a brand",
          helper: "Pick the bike brand.",
        },
        standardModel: {
          label: "Standard model",
          placeholder: "Choose a model",
          helper: "Pick the bike model.",
        },
        year: {
          label: "Model year",
          placeholder: "Choose a year",
          helper: "Choose the matching model year.",
          unknownOptionLabel: "Year not specified ({count})",
        },
        size: {
          label: "Frame size",
          placeholder: "Choose a size",
          helper: "Choose the matching size.",
        },
        preview: {
          title: "Linked geometry preview",
          description: "",
          year: "Year",
          size: "Frame size",
          stack: "Stack",
          reach: "Reach",
          seatTubeAngle: "Seat tube angle",
          headTubeAngle: "Head tube angle",
          unavailable: "Unavailable",
        },
        customBrandAction: "My bike is not in the list",
        customModelAction: "My model is not listed",
        customExplanation: "Fallback saves only on your bike.",
        linkedTitle: "Linked geometry record kept",
        linkedDescription: "Linked geometry will be cleared when fallback starts.",
      },
    },
  },
} as const;

function TestHarness({
  initialState,
}: {
  initialState: BikeGeometryFallbackState;
}) {
  const [state, setState] = useState(initialState);
  return (
    <BikeGeometryLibraryFields
      state={state}
      onChange={setState}
      messages={messages as never}
    />
  );
}

function installStandardQueries() {
  useQueryMock.mockImplementation(((query: unknown, args?: unknown) => {
    switch (query) {
      case "listBrandsForRider":
        return [
          { brandId: "brand_trek", name: "Trek", hasUsableModels: true },
          { brandId: "brand_canyon", name: "Canyon", hasUsableModels: true },
        ];
      case "listModelsForRiderBrand":
        return args && (args as { brandId: string }).brandId === "brand_trek"
          ? [
              {
                modelKey: "emonda::road",
                name: "Emonda SL",
                yearSelectionRequired: true,
                hasUsableSizes: true,
                yearOptions: [
                  { modelId: "model_2023", yearLabel: "2023", sizeRecordCount: 3 },
                  { modelId: "model_2022", yearLabel: "2022", sizeRecordCount: 2 },
                ],
              },
            ]
          : [];
      case "listSizeRecordsForRiderModel":
        return args && (args as { modelId: string }).modelId === "model_2023"
          ? {
              sizeOptions: [
                { recordId: "record_54", sizeLabel: "54" },
                { recordId: "record_56", sizeLabel: "56" },
              ],
            }
          : { sizeOptions: [] };
      case "getGeometryRecordPreview":
        return args && (args as { recordId: string }).recordId === "record_56"
          ? {
              recordId: "record_56",
              sizeLabel: "56",
              stackMm: 563,
              reachMm: 387,
              seatTubeAngle: 73.5,
              headTubeAngle: 72.8,
            }
          : null;
      case "getGeometryRecordSelectionForRider":
        return args && (args as { recordId: string }).recordId === "record_56"
          ? {
              recordId: "record_56",
              brandId: "brand_trek",
              brandName: "Trek",
              modelFamilyKey: "emonda::road",
              modelId: "model_2023",
              modelName: "Emonda SL",
              yearLabel: "2023",
              sizeLabel: "56",
            }
          : null;
      default:
        return undefined;
    }
  }) as never);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BikeGeometryLibraryFields", () => {
  it("guides the rider through brand, model, year, and size chips", async () => {
    installStandardQueries();

    render(<TestHarness initialState={createBikeGeometryFallbackState({})} />);

    fireEvent.click(screen.getByRole("button", { name: "Trek" }));
    fireEvent.click(screen.getByRole("button", { name: "Emonda SL" }));
    fireEvent.click(screen.getByRole("button", { name: "2023" }));
    fireEvent.click(screen.getByRole("button", { name: "56" }));

    await waitFor(() => {
      expect(screen.getByText("Trek · Emonda SL · 2023 · 56")).toBeTruthy();
      expect(screen.getByText("563 mm")).toBeTruthy();
      expect(screen.getByText("387 mm")).toBeTruthy();
      expect(screen.getByText("73.5°")).toBeTruthy();
      expect(screen.getByText("72.8°")).toBeTruthy();
    });
  });

  it("hydrates edit state from an existing linked record", async () => {
    installStandardQueries();

    render(
      <TestHarness
        initialState={createBikeGeometryFallbackState({
          brand: "Trek",
          model: "Emonda SL",
          geometryRecordId: "record_56",
          geometrySizeLabel: "56",
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Trek · Emonda SL · 2023 · 56")).toBeTruthy();
      expect(screen.getByText("563 mm")).toBeTruthy();
    });
  });

  it("switches to the custom fallback disclosure when the bike is not listed", async () => {
    installStandardQueries();

    render(<TestHarness initialState={createBikeGeometryFallbackState({})} />);

    fireEvent.click(screen.getByRole("button", { name: /my bike is not in the list/i }));
    fireEvent.change(screen.getByLabelText("Brand"), { target: { value: "Time" } });
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "ADHX" } });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Time")).toBeTruthy();
      expect(screen.getByDisplayValue("ADHX")).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Trek" })).toBeNull();
    });
  });
});
