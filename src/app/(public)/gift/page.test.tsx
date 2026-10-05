// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { giftsCopy } from "@/i18n/account/gifts";
import { giftTokenStorageKey } from "@/components/gifts/giftHelpers";

const runtime = vi.hoisted(() => ({
  account: "first",
  token: "a".repeat(64),
  status: "valid",
  redeem: vi.fn(),
}));

vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    gifts: { queries: { preview: "preview" }, mutations: { redeem: "redeem" } },
    users: { queries: { getCurrentUser: "user" } },
    bikes: { queries: { listByUser: "bikes" } },
  },
}));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  useMutation: () => runtime.redeem,
  useQuery: (query: string) =>
    query === "user"
      ? { _id: runtime.account }
      : query === "bikes"
        ? [{ _id: `${runtime.account}-bike`, name: "My bike" }]
        : { status: runtime.status },
}));
vi.mock("@/components/gifts/useGiftToken", () => ({
  useGiftToken: () => runtime.token,
}));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: "en" }),
}));

import GiftPage from "./page";

beforeEach(() => {
  runtime.account = "first";
  runtime.token = "a".repeat(64);
  runtime.status = "valid";
  runtime.redeem.mockReset();
});
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

async function submit() {
  fireEvent.mouseDown(screen.getByRole("combobox"));
  fireEvent.click(await screen.findByRole("option", { name: "My bike" }));
  fireEvent.click(screen.getByRole("button", { name: giftsCopy.en.redeem }));
}

it("keeps success after a reactive preview update but resets it when the account changes", async () => {
  runtime.redeem.mockResolvedValue({ status: "redeemed" });
  const view = render(<GiftPage />);
  await submit();
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe(giftsCopy.en.success),
  );
  runtime.status = "redeemed";
  view.rerender(<GiftPage />);
  expect(screen.getByRole("status").textContent).toBe(giftsCopy.en.success);
  runtime.account = "second";
  view.rerender(<GiftPage />);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    giftsCopy.en.redeemed,
  );
});

it("does not apply an old request success to a new account or erase a newly opened gift", async () => {
  let complete: (value: { status: string }) => void = () => {};
  runtime.redeem.mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const view = render(<GiftPage />);
  await submit();
  runtime.account = "second";
  runtime.token = "b".repeat(64);
  window.sessionStorage.setItem(giftTokenStorageKey, runtime.token);
  view.rerender(<GiftPage />);
  await act(async () => {
    complete({ status: "redeemed" });
  });
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    giftsCopy.en.receive,
  );
  expect(window.sessionStorage.getItem(giftTokenStorageKey)).toBe(
    runtime.token,
  );
});
