import { afterEach, describe, expect, it, vi } from "vitest";
import { isPersonalFitSalesEnabled, isPersonalFitSalesVisible } from "./personalFit";

afterEach(() => vi.unstubAllEnvs());

describe("personal fit sales flags", () => {
  it.each([undefined, "", "false", "TRUE", "1", " true ", "true"])(
    "authorizes only the exact server value true (%s), independently of presentation",
    (serverValue) => {
      vi.stubEnv("PERSONAL_FIT_SALES_ENABLED", serverValue);
      for (const publicValue of [undefined, "false", "true"]) {
        vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", publicValue);
        expect(isPersonalFitSalesEnabled()).toBe(serverValue === "true");
      }
    },
  );

  it.each([undefined, "", "false", "TRUE", "1", " true ", "true"])(
    "shows sales only for the exact public value true (%s), independently of authorization",
    (publicValue) => {
      vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", publicValue);
      for (const serverValue of [undefined, "false", "true"]) {
        vi.stubEnv("PERSONAL_FIT_SALES_ENABLED", serverValue);
        expect(isPersonalFitSalesVisible()).toBe(publicValue === "true");
      }
    },
  );
});
