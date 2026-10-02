/* @vitest-environment jsdom */

import { StrictMode } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LoginLocaleBackfill } from "./LoginLocaleBackfill";

const state = vi.hoisted(() => ({
  isAuthenticated: false, isLoading: false, pathname: "/nl/login", save: vi.fn(),
}));
vi.mock("convex/react", () => ({ useConvexAuth: () => state, useMutation: () => state.save }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
afterEach(cleanup);
beforeEach(() => {
  state.isAuthenticated = false;
  state.isLoading = false;
  state.pathname = "/nl/login";
  state.save.mockReset().mockResolvedValue(null);
});

it("backfills once after authentication, not again on navigation or locale changes", () => {
  const view = render(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  expect(state.save).not.toHaveBeenCalled();
  state.isAuthenticated = true;
  view.rerender(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  expect(state.save).toHaveBeenCalledExactlyOnceWith({ locale: "nl" });
  state.pathname = "/en/dashboard";
  view.rerender(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  expect(state.save).toHaveBeenCalledTimes(1);
  state.isAuthenticated = false;
  view.rerender(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  state.isAuthenticated = true;
  view.rerender(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  expect(state.save).toHaveBeenLastCalledWith({ locale: "en" });
  expect(state.save).toHaveBeenCalledTimes(2);
});

it("waits for auth readiness and covers direct OAuth dashboard returns", () => {
  state.isAuthenticated = true;
  state.isLoading = true;
  state.pathname = "/en/dashboard";
  const view = render(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  expect(state.save).not.toHaveBeenCalled();
  state.isLoading = false;
  view.rerender(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  expect(state.save).toHaveBeenCalledExactlyOnceWith({ locale: "en" });
});

it("handles rejection without an unhandled error or repeated writes", async () => {
  state.isAuthenticated = true;
  state.save.mockRejectedValue(new Error("Offline"));
  const view = render(<LoginLocaleBackfill />);
  await waitFor(() => expect(state.save).toHaveBeenCalledTimes(1));
  view.rerender(<LoginLocaleBackfill />);
  expect(state.save).toHaveBeenCalledTimes(1);
});

it("does not duplicate the initial authenticated effect under StrictMode", () => {
  state.isAuthenticated = true;
  render(<StrictMode><LoginLocaleBackfill /></StrictMode>);
  expect(state.save).toHaveBeenCalledExactlyOnceWith({ locale: "nl" });
});

it("waits for an explicit page locale rather than guessing on unprefixed routes", () => {
  state.isAuthenticated = true;
  state.pathname = "/admin";
  const view = render(<LoginLocaleBackfill />);
  expect(state.save).not.toHaveBeenCalled();
  state.pathname = "/nl/dashboard";
  view.rerender(<LoginLocaleBackfill />);
  expect(state.save).toHaveBeenCalledExactlyOnceWith({ locale: "nl" });
});
