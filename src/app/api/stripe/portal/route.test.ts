import { expect, it, vi } from "vitest";
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: vi.fn() }));

import { POST as portal } from "./route";
import { POST as checkout } from "../checkout/route";

it("uses the same inert authenticated adapter for the customer portal", () => {
  expect(portal).toBe(checkout);
});
