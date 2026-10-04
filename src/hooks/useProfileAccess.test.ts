import { afterEach, expect, it, vi } from "vitest";
import { useProfileAccess } from "./useProfileAccess";

const state = vi.hoisted(() => ({ query: vi.fn(), enforced: false }));
vi.mock("convex/react", () => ({ useQuery: state.query }));
vi.mock("../../shared/pricing/flags", () => ({ isPaidAccessEnforced: () => state.enforced }));
afterEach(() => { state.enforced = false; state.query.mockReset(); });

it("skips access lookup and preserves full access with enforcement off", () => {
  expect(useProfileAccess()).toMatchObject({ enforced: false, fullProfile: true, isLoading: false });
  expect(state.query.mock.calls[0][1]).toBe("skip");
});

it("is conservative while loading or logged out and follows reactive expiry", () => {
  state.enforced = true;
  expect(useProfileAccess()).toMatchObject({ fullProfile: false, isLoading: true });
  expect(state.query.mock.calls[0][1]).toEqual({});
  state.query.mockReturnValue(null);
  expect(useProfileAccess()).toMatchObject({ fullProfile: false, isLoading: false });
  state.query.mockReturnValue({ fullProfile: true });
  expect(useProfileAccess().fullProfile).toBe(true);
  state.query.mockReturnValue({ fullProfile: false });
  expect(useProfileAccess().fullProfile).toBe(false);
});
