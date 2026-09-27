/* @vitest-environment jsdom */

import { act, cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroBackground } from "./HeroBackground";

let motion: EventTarget & { matches: boolean };
let connection: EventTarget & { saveData: boolean; effectiveType: string };

beforeEach(() => {
  vi.useFakeTimers();
  motion = Object.assign(new EventTarget(), { matches: false });
  connection = Object.assign(new EventTarget(), { saveData: false, effectiveType: "4g" });
  vi.stubGlobal("matchMedia", () => motion);
  Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "connection");
});

describe("HeroBackground media loading", () => {
  it("serves the poster without a video download in the server HTML", () => {
    const html = renderToString(<HeroBackground posterSrc="/poster.jpg" />);
    expect(html).toContain('src="/poster.jpg"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).not.toContain("<video");
    expect(html).not.toContain(".mp4");
  });

  it("waits for the initial page load before adding the smaller video source", () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    const { container } = render(<HeroBackground posterSrc="/poster.jpg" />);
    act(() => vi.runAllTimers());
    expect(container.querySelector("video")).toBeNull();

    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    act(() => window.dispatchEvent(new Event("load")));
    expect(container.querySelector("video")).toBeNull();
    act(() => vi.runAllTimers());
    expect(container.querySelector("video source")?.getAttribute("src")).toBe(
      "/bestbikefit4u-home.mp4"
    );
  });

  it.each(["reduced motion", "data saver", "slow connection"])(
    "keeps the poster and skips video with %s enabled",
    (preference) => {
      motion.matches = preference === "reduced motion";
      connection.saveData = preference === "data saver";
      connection.effectiveType = preference === "slow connection" ? "2g" : "4g";
      const { container } = render(<HeroBackground posterSrc="/poster.jpg" />);
      act(() => vi.runAllTimers());
      expect(container.querySelector("video")).toBeNull();
      expect(container.querySelector("img")?.getAttribute("src")).toBe("/poster.jpg");
    }
  );

  it("stops playback if the visitor enables reduced motion later", () => {
    const { container } = render(<HeroBackground posterSrc="/poster.jpg" />);
    act(() => vi.runAllTimers());
    expect(container.querySelector("video")).not.toBeNull();
    motion.matches = true;
    act(() => motion.dispatchEvent(new Event("change")));
    expect(container.querySelector("video")).toBeNull();
  });

  it("supports browsers without the optional Network Information API", () => {
    Reflect.deleteProperty(navigator, "connection");
    const { container } = render(<HeroBackground posterSrc="/poster.jpg" />);
    act(() => vi.runAllTimers());
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("cancels pending playback and removes preference listeners on unmount", () => {
    const removeMotionListener = vi.spyOn(motion, "removeEventListener");
    const removeConnectionListener = vi.spyOn(connection, "removeEventListener");
    const { unmount } = render(<HeroBackground posterSrc="/poster.jpg" />);
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(removeMotionListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(removeConnectionListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
