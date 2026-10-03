import { describe, expect, it } from "vitest";
import { ftpSliderStartCopy } from "./ftpSliderStart";

describe("FTP slider starting-position copy", () => {
  it("uses the requested Dutch explanation, not a predicted result", () => {
    expect(ftpSliderStartCopy.nl.hint).toBe(
      "We hebben de regelaar alvast op een gebruikelijke waarde gezet. Pas hem aan naar je eigen FTP.",
    );
    expect(ftpSliderStartCopy.nl.pending).toContain("bevestig");
  });
  it("keeps English keys in parity and explains the starting control", () => {
    expect(Object.keys(ftpSliderStartCopy.en)).toEqual(Object.keys(ftpSliderStartCopy.nl));
    expect(ftpSliderStartCopy.en.hint).toContain("starting value");
    expect(ftpSliderStartCopy.en.pending).toContain("confirm");
  });
});
