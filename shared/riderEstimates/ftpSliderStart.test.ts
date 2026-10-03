import { describe, expect, it } from "vitest";
import { FTP_SLIDER_REFERENCE, getFtpSliderStart } from "./ftpSliderStart";

const control = { min: 80, max: 500, step: 5 };

describe("FTP slider starting position", () => {
  it("retains exact cited Fair-category ranges, without a predictive claim", () => {
    expect(FTP_SLIDER_REFERENCE.wattsPerKg).toEqual({
      male: { min: 2.23, max: 2.78 }, female: { min: 1.9, max: 2.35 },
    });
    expect(FTP_SLIDER_REFERENCE.choice).toContain("not predicted FTP");
  });
  it.each([
    ["male", 80, 180], ["female", 80, 150], ["male", 60, 135], ["female", 60, 115],
  ] as const)("uses %s lower boundary at %s kg rounded to step", (sex, weightKg, expected) => {
    expect(getFtpSliderStart({ ...control, sex, weightKg })).toBe(expected);
  });
  it.each([80, 230, 700])("never replaces known FTP %s, even outside this control", (knownFtpWatts) => {
    expect(getFtpSliderStart({ ...control, sex: "male", weightKg: 80, knownFtpWatts })).toBeNull();
  });
  it.each([undefined, null, "prefer_not_to_say"] as const)("does not guess unavailable sex %s", (sex) => {
    expect(getFtpSliderStart({ ...control, sex, weightKg: 80 })).toBeNull();
  });
  it.each([undefined, null, 0, -1, NaN, Infinity, 10, 1000])("keeps today's default for invalid weight %s", (weightKg) => {
    expect(getFtpSliderStart({ ...control, sex: "female", weightKg })).toBeNull();
  });
  it("rounds relative to control min rather than inventing an unsupported step", () => {
    expect(getFtpSliderStart({ min: 81, max: 500, step: 5, sex: "male", weightKg: 80 })).toBe(176);
  });
  it.each([{ step: 0 }, { min: NaN }, { max: 10 }])("rejects invalid controls %j", (invalid) => {
    expect(getFtpSliderStart({ ...control, ...invalid, sex: "male", weightKg: 80 })).toBeNull();
  });
});
