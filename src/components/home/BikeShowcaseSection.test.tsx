/* @vitest-environment jsdom */

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Messages } from "@/i18n/getDictionary";
import { BikeShowcaseSection } from "./BikeShowcaseSection";

const { query } = vi.hoisted(() => ({ query: vi.fn(() => undefined) }));
vi.mock("convex/react", () => ({ useQuery: query }));
vi.mock("./BikeShowcaseCarousel", () => ({ BikeShowcaseCarousel: () => null }));

const copy = {
  eyebrow: "Featured bikes",
  title: "Bikes on the platform",
  subtitle: "Find a starting point",
} as Messages["home"]["bikeShowcase"];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("BikeShowcaseSection deferred subscription", () => {
  it("skips the query while hidden and subscribes when approaching the viewport", () => {
    let intersect: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { intersect = callback; }
      observe = vi.fn();
      disconnect = disconnect;
    });

    render(<BikeShowcaseSection locale="en" copy={copy} />);
    expect(query.mock.calls.at(-1)).toEqual([expect.anything(), "skip"]);
    expect(screen.getByRole("button", { name: "Start bike fit" }).getAttribute("href"))
      .toBe("/en/calculators/bike-fit");

    act(() => intersect([{ isIntersecting: false }] as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(query.mock.calls.at(-1)).toEqual([expect.anything(), "skip"]);

    act(() => intersect([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(query.mock.calls.at(-1)).toEqual([expect.anything(), {}]);
    expect(disconnect).toHaveBeenCalled();
  });

  it("still loads on browsers without IntersectionObserver", async () => {
    Reflect.deleteProperty(window, "IntersectionObserver");
    render(<BikeShowcaseSection locale="nl" copy={copy} />);
    await waitFor(() => expect(query.mock.calls.at(-1)).toEqual([expect.anything(), {}]));
  });
});
