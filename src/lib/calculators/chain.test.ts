import { describe, expect, it } from "vitest";
import { accountChainBindings } from "./accountChain";
import { calculatorDefaults, resolveCalculatorValues } from "./accountState";
import { changedChainInputs, equalChainValues, type ChainBinding } from "./chain";

describe("canonical calculator chain mapping", () => {
  it("requires an explicit field confirmation when accepting an unchanged placeholder", () => {
    const values = { ftp: 200, weight: 90 };
    const bindings: ChainBinding<typeof values>[] = [
      { field: "ftpWatts", source: "profile", value: undefined,
        read: input => input.ftp, write: (input, ftp) => ({ ...input, ftp: Number(ftp) }) },
      { field: "weightKg", source: "profile", value: undefined,
        read: input => input.weight, write: (input, weight) => ({ ...input, weight: Number(weight) }) },
    ];
    expect(changedChainInputs(values, values, bindings, [])).toEqual([]);
    expect(changedChainInputs(values, values, bindings, [], ["ftpWatts"])).toEqual([
      { field: "ftpWatts", source: "profile", value: 200, expectedCurrentValue: null, kind: "declared" },
    ]);
    expect(changedChainInputs(values, values, [{ ...bindings[0], value: 200 }], [], ["ftpWatts"]))
      .toEqual([]);
    expect(changedChainInputs(values, values, bindings, [], ["unknown"])).toEqual([]);
  });
  it("treats newly allocated drivetrain arrays as equal and preserves expected absence on conflicts", () => {
    const bindings: ChainBinding<{ gears: number[] }>[] = [{ field: "gearing.chainrings", source: "bike", value: undefined,
      read: value => value.gears, write: (value, gears) => ({ ...value, gears: gears as number[] }) }];
    expect(equalChainValues([50, 34], [50, 34])).toBe(true);
    expect(changedChainInputs({ gears: [50, 34] }, { gears: [50, 34] }, bindings, [])).toEqual([]);
    const first = changedChainInputs({ gears: [50, 34] }, { gears: [52, 36] }, bindings, []);
    const updated = changedChainInputs({ gears: [52, 36] }, { gears: [53, 39] },
      [{ ...bindings[0], value: [48, 32] }], first);
    expect(updated[0].expectedCurrentValue).toBeNull();
  });
  it("uses selected bike measurements over old saved state and maps only that bike's actual input fields", () => {
    const saved = { ...calculatorDefaults["saddle-height"], current: 800, category: "road" as const };
    const bike = { bikeType: "mountain", currentSetup: { saddleHeightMm: 735 } };
    expect(resolveCalculatorValues("saddle-height", saved, { inseamCm: 83 }, bike).values)
      .toMatchObject({ current: 735, currentConfirmed: true, compare: true, category: "mtb" });
    expect(accountChainBindings("saddle-height", null, null).some((binding) => binding.source === "bike")).toBe(false);
    expect(accountChainBindings("saddle-height", null, bike).find((binding) => binding.field === "bikeType")
      ?.read({ ...saved, category: "mtb" })).toBe("mountain");
  });
  it("does not claim unused fuel or power FTP values were engine inputs", () => {
    expect(accountChainBindings("fuel-hydration", { weightKg: 70, ftpWatts: 250 }, null)
      .map((binding) => binding.field)).toEqual(["sweatProfile"]);
    expect(accountChainBindings("power-speed", { ftpWatts: 250 }, null)
      .some((binding) => binding.field === "ftpWatts")).toBe(false);
    const bindings = accountChainBindings("ftp-wkg", { ftpWatts: 250 }, null);
    expect(bindings.find((binding) => binding.field === "ftpWatts")?.read({
      ...calculatorDefaults["ftp-wkg"], method: "ramp",
    })).toBeUndefined();
  });
  it("prefills a recorded FTP wattage as known instead of running the original protocol on example inputs", () => {
    const values = resolveCalculatorValues("ftp-wkg", null, { ftpWatts: 260, ftpMethod: "ramp" }).values;
    expect(values.method).toBe("known");
    expect(values.values.ftp).toBe(260);
  });
});
