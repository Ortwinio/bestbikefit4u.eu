/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQuery } from "convex/react";
import { SaddleSelectorForm } from "./SaddleSelectorForm";

let bikeIdParam: string | null = null;

const bikes = [
  {
    _id: "bike_a",
    name: "Endurance Road",
    bikeType: "road",
    ridingStyle: "fitness",
    primaryGoal: "comfort",
  },
  {
    _id: "bike_b",
    name: "Race Road",
    bikeType: "road",
    ridingStyle: "racing",
    primaryGoal: "performance",
  },
];

const saveSessionMock = vi.fn();
const useQueryMock = vi.mocked(useQuery);

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "bikeId" ? bikeIdParam : null),
  }),
}));

vi.mock("convex/react", () => ({
  useMutation: () => saveSessionMock,
  useQuery: vi.fn(),
}));

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: "en",
    messages: {
      common: { toasts: { fitSessionStarted: "" } },
      saddleSelector: {
        title: "Saddle selector",
        subtitle: "Pick a bike and get a saddle recommendation.",
        anatomy: "Anatomy",
        measuredMode: "Measured",
        estimatedMode: "Estimated",
        sitBoneWidth: "Sit bone width",
        fromProfile: "From profile",
        height: "Height",
        weight: "Weight",
        hipCircumference: "Hip circumference",
        flexibility: "Flexibility",
        coreStability: "Core stability",
        ridingProfile: "Riding profile",
        bike: "Bike",
        selectBike: "Select bike",
        ridingType: "Riding type",
        positionStyle: "Position style",
        indoorOutdoor: "Indoor/outdoor",
        typicalRideLength: "Typical ride length",
        currentSaddle: "Current saddle",
        hideOptional: "Hide optional",
        showOptional: "Show optional",
        currentWidth: "Current width",
        currentFeel: "Current feel",
        currentShape: "Current shape",
        currentTilt: "Current tilt",
        symptoms: "Symptoms",
        calculate: "Calculate",
        saved: "Saved",
        targetWidth: "Target width",
        widthRange: "Width range",
        confidence: "Confidence",
        currentComparison: "Current comparison",
        saddleFamily: "Saddle family",
        noseType: "Nose type",
        profileShape: "Profile shape",
        cutout: "Cutout",
        yes: "Yes",
        no: "No",
        padding: "Padding",
        fitInteractionNotes: "Fit interaction notes",
        save: "Save",
        previousRecommendations: "Previous recommendations",
      },
    },
  }),
}));

vi.mock("@/components/public", () => ({
  PublicInfoPanel: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    isLoading,
    ...props
  }: {
    children?: React.ReactNode;
    isLoading?: boolean;
    [key: string]: unknown;
  }) => (
    <button {...props} disabled={Boolean(isLoading) || Boolean(props.disabled)}>
      {children}
    </button>
  ),
  Card: ({ children }: { children?: React.ReactNode }) => <section>{children}</section>,
  CardContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  NumberInput: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
  }) => (
    <label>
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        value={value ?? ""}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue === "" ? null : Number(nextValue));
        }}
      />
    </label>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (event: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  }) => (
    <label>
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={onChange as never}>
        <option value="">{placeholder ?? "Select"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

vi.mock("@/lib/saddle-width-engine", () => ({
  calculateSaddleWidth: () => ({
    finalRecommendedWidthMm: 143,
    widthRangeMinMm: 141,
    widthRangeMaxMm: 145,
    primaryWidthClass: "143 mm",
    confidenceScore: 82,
    confidenceLevel: "high",
    widthMatchScore: 91,
    widthMatchAssessment: "good_match",
    explanationKey: "measured_result",
  }),
  classifySaddleSuitability: () => ({
    saddleFamily: "endurance_allroad",
    noseType: "traditional_nose",
    profileShape: "moderate_wave",
    cutoutRecommended: true,
    paddingPreference: "medium",
    fitInteractionWarnings: [],
  }),
}));

beforeEach(() => {
  bikeIdParam = null;
  saveSessionMock.mockReset();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  useQueryMock.mockImplementation(((_query: unknown, args: unknown) => {
    const typedArgs = args as
      | { bikeId?: string; limit?: number }
      | "skip"
      | undefined;

    if (typedArgs === undefined) {
      return {
        sitBoneWidthMm: null,
        heightCm: null,
        weightKg: null,
        hipCircumferenceCm: null,
        flexibilityScore: null,
        coreStabilityScore: null,
      };
    }

    if (typedArgs === "skip") {
      return undefined;
    }

    if (typeof typedArgs === "object" && "bikeId" in typedArgs && typedArgs.bikeId) {
      return bikes.find((bike) => bike._id === typedArgs.bikeId) ?? null;
    }

    if (typeof typedArgs === "object" && "limit" in typedArgs) {
      return [];
    }

    if (typeof typedArgs === "object" && Object.keys(typedArgs).length === 0) {
      return bikes;
    }

    return undefined;
  }) as never);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SaddleSelectorForm", () => {
  it("keeps the bike unbound until the user selects one", async () => {
    render(<SaddleSelectorForm />);

    expect((screen.getByLabelText("Bike") as HTMLSelectElement).value).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));

    expect(saveSessionMock).toHaveBeenCalledTimes(1);
    expect(saveSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        bikeId: undefined,
        ridingType: "endurance_road",
        postureCategory: "balanced",
      })
    );
  });

  it("prefills derived defaults from the selected bike and saves that bike id", async () => {
    render(<SaddleSelectorForm />);

    fireEvent.change(screen.getByLabelText("Bike"), {
      target: { value: "bike_b" },
    });

    await waitFor(
      () => expect((screen.getByLabelText("Riding type") as HTMLSelectElement).value).toBe("road_race")
    );
    await waitFor(
      () => expect((screen.getByLabelText("Position style") as HTMLSelectElement).value).toBe("aggressive")
    );

    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));

    expect(saveSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        bikeId: "bike_b",
        ridingType: "road_race",
        postureCategory: "aggressive",
      })
    );
  });

  it("hydrates the selected bike from the bikeId query parameter", async () => {
    bikeIdParam = "bike_a";

    render(<SaddleSelectorForm />);

    await waitFor(() => expect((screen.getByLabelText("Bike") as HTMLSelectElement).value).toBe("bike_a"));
    expect((screen.getByLabelText("Riding type") as HTMLSelectElement).value).toBe("endurance_road");
    expect((screen.getByLabelText("Position style") as HTMLSelectElement).value).toBe("upright");

    fireEvent.click(screen.getByRole("button", { name: "Calculate" }));
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));

    expect(saveSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        bikeId: "bike_a",
      })
    );
  });
});
