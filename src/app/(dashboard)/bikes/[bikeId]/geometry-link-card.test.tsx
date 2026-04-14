/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { GeometryLinkCard, getGeometryCardCopy } from "./GeometryLinkCard";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children?: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    render,
    ...props
  }: {
    children?: ReactNode;
    render?: ReactElement;
    [key: string]: unknown;
  }) =>
    render
      ? <a {...(render.props as Record<string, unknown>)} {...props}>{children}</a>
      : <button {...props}>{children}</button>,
  Card: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({
    children,
    ...props
  }: {
    children?: ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
  CardTitle: ({
    children,
    ...props
  }: {
    children?: ReactNode;
    [key: string]: unknown;
  }) => <h2 {...props}>{children}</h2>,
  CardContent: ({
    children,
    ...props
  }: {
    children?: ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
  CardDescription: ({
    children,
    ...props
  }: {
    children?: ReactNode;
    [key: string]: unknown;
  }) => <p {...props}>{children}</p>,
}));

vi.mock("@/lib/bikes", () => ({
  getBikeTypeLabel: (bikeType: string) => bikeType,
}));

const messages = {
  fit: {
    ridingStyles: {
      performance: { label: "Performance" },
    },
    goals: {
      race: { label: "Race" },
    },
  },
} as const;

describe("GeometryLinkCard", () => {
  it("renders the linked rider-facing geometry card", () => {
    render(
      <GeometryLinkCard
        locale="en"
        state="linked"
        linkedGeometry={{
          recordId: "record_1",
          brandName: "Canyon",
          modelName: "Endurace CF",
          modelYearLabel: "2024",
          sizeLabel: "M",
          stack: 580,
          reach: 395,
          seatTubeAngle: 73.5,
          headTubeAngle: 72.8,
          source: "manufacturer",
          sourceUrl: "https://example.com/geometry",
          status: "superseded",
          version: 2,
          supersededByRecordId: "record_2",
        }}
        bike={{
          bikeType: "Road",
          ridingStyle: "performance",
          primaryGoal: "race",
          brand: "Canyon",
          model: "Endurace CF",
          bikeWeightKg: 8.2,
          currentGeometry: null,
        }}
        editHref="/en/bikes/bike_1/edit"
        messages={messages as never}
      />
    );

    expect(screen.getByText("Canyon · Endurace CF · 2024 · M")).toBeTruthy();
    expect(screen.getByText("580 mm")).toBeTruthy();
    expect(screen.getByText("395 mm")).toBeTruthy();
    expect(screen.getByText("73.5°")).toBeTruthy();
    expect(screen.getByText("72.8°")).toBeTruthy();
    expect(screen.getByText("Newer geometry data is available")).toBeTruthy();
    expect(screen.getByText("Road · Performance · Race · 8.2 kg")).toBeTruthy();
    expect(screen.queryByText("Manufacturer")).toBeNull();
  });

  it("renders manual values and relink action for unavailable records", () => {
    render(
      <GeometryLinkCard
        locale="en"
        state="missing_record"
        linkedGeometry={null}
        bike={{
          bikeType: "Road",
          ridingStyle: "performance",
          primaryGoal: "race",
          brand: "Canyon",
          model: "Endurace CF",
          bikeWeightKg: 8.2,
          currentGeometry: {
            stackMm: 578,
            reachMm: 390,
            frameSize: "M",
          },
        }}
        editHref="/en/bikes/bike_1/edit"
        messages={messages as never}
      />
    );

    expect(screen.getByText("The geometry record is no longer available")).toBeTruthy();
    expect(screen.getByText(/Manual/)).toBeTruthy();
    expect(screen.getByText(/Stack: 578 mm/)).toBeTruthy();
    expect(screen.getByText(/Reach: 390 mm/)).toBeTruthy();
    expect(screen.getByText(/Frame size: M/)).toBeTruthy();
    expect(screen.getByText("Re-link geometry")).toBeTruthy();
  });

  it("keeps the updated copy contract", () => {
    const copy = getGeometryCardCopy("en");

    expect(copy.linkedTitle).toBe("Linked geometry record");
    expect(copy.linkGeometry).toBe("Link geometry");
    expect(copy.relinkGeometry).toBe("Re-link geometry");
    expect(copy.changeGeometry).toBe("Change");
    expect(copy.linkPrompt.toLowerCase()).toContain("geometry library");
  });
});
