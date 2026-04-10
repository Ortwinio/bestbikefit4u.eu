/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BikeGearingCard } from "./BikeGearingCard";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("BikeGearingCard", () => {
  it("renders a validated gearing summary with calculator and edit links", () => {
    render(
      <BikeGearingCard
        locale="en"
        bikeId="bike_1"
        gearing={{
          drivetrainType: "2x",
          chainrings: [50, 34],
          cassetteTeeth: [11, 13, 15, 17, 19, 21, 24, 28, 34],
          wheelCircumferenceMm: 2105,
          crankLengthMm: 172.5,
          completeness: "validated",
        }}
      />
    );

    expect(screen.getByText("Gearing")).toBeTruthy();
    expect(screen.getByText("34 x 34")).toBeTruthy();
    expect(screen.getByText("50 x 11")).toBeTruthy();
    expect(screen.getByText("Open gearing calculator").closest("a")?.getAttribute("href")).toBe(
      "/en/gearing?bikeId=bike_1"
    );
    expect(screen.getByText("Edit gearing").closest("a")?.getAttribute("href")).toBe(
      "/en/bikes/bike_1/edit"
    );
  });

  it("renders the incomplete-state CTA when gearing is missing", () => {
    render(<BikeGearingCard locale="en" bikeId="bike_2" gearing={null} />);

    expect(screen.getByText("No gearing saved yet")).toBeTruthy();
    expect(
      screen.getByText(
        "Add chainrings, cassette, and wheel circumference to use this bike directly in the gearing calculator."
      )
    ).toBeTruthy();
    expect(screen.getByText("Add gearing").closest("a")?.getAttribute("href")).toBe(
      "/en/bikes/bike_2/edit"
    );
    expect(screen.getByText("Open calculator").closest("a")?.getAttribute("href")).toBe(
      "/en/gearing?bikeId=bike_2"
    );
  });
});
