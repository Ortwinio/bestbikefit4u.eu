/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { handoffMessages } from "@/i18n/calculators/handoff";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { HandoffPrefillNotice } from "./HandoffPrefillNotice";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});

describe.each(["nl", "en"] as const)("known effort values (%s)", (locale) => {
  it.each([
    ["easy", "Rustig", "Easy"],
    ["endurance", "Duur", "Endurance"],
    ["tempo", "Tempo", "Tempo"],
    ["race", "Wedstrijd", "Race"],
  ])("localizes %s without changing reused provenance", (value, nl, en) => {
    writeHandoffEntry({ field: "intensity", value, unit: "none",
      calculator: "fuel-hydration", method: "declared", touchedAt: Date.now() });
    const original = readHandoff();
    render(<HandoffPrefillNotice calculator="fuel-hydration" locale={locale} fields={["intensity"]} />);
    expect(screen.getByRole("status").textContent).toContain(
      `${handoffMessages[locale].fields.intensity} ${locale === "nl" ? nl : en}`,
    );
    expect(readHandoff()).toEqual(original);
    expect(localStorage.length).toBe(0);
  });
});
