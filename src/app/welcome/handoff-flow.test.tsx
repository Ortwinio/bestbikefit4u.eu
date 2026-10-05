/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SaddleHeightCalculatorForm } from "../(public)/calculators/saddle-height/SaddleHeightCalculatorForm";
import LoginPage from "../(auth)/login/page";
import { readHandoff, clearHandoff } from "@/lib/handoff/store";
import { saddleReliabilityMessages } from "@/i18n/calculators/saddleReliability";
import { importHandoff } from "../../../convex/profiles/handoff";

const state = vi.hoisted(() => ({ authenticated: false, replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/login",
  useSearchParams: () => new URLSearchParams("src=saddle-height&handoff=1"),
  useRouter: () => ({ replace: state.replace, push: state.push }),
}));
vi.mock("@convex-dev/auth/react", () => ({ useAuthActions: () => ({ signIn: vi.fn() }) }));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: state.authenticated, isLoading: false }),
  useQuery: () => null,
  useMutation: () => vi.fn(),
}));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => "en" }));
vi.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => "handoff_user" }));

afterEach(() => { cleanup(); clearHandoff(); state.authenticated = false; vi.clearAllMocks(); });

it("public saddle-height → login → confirmed profile preserves inseam provenance without URL values", async () => {
  clearHandoff();
  render(<SaddleHeightCalculatorForm />);
  expect(readHandoff().entries).toEqual([]);
  const copy = saddleReliabilityMessages.en;
  fireEvent.keyDown(screen.getByRole("slider", { name: copy.height }), { key: "ArrowRight" });
  fireEvent.keyDown(screen.getByRole("slider", { name: copy.inseam }), { key: "ArrowRight" });
  const entry = readHandoff().entries.find((item) => item.field === "inseamCm");
  expect(entry).toMatchObject({ value: 89.5, method: "measured", calculator: "saddle-height" });
  const cta = screen.getAllByRole("link").find((link) => link.getAttribute("href")?.includes("handoff=1"));
  const destination = new URL(cta!.getAttribute("href")!, "https://bikefitboost.com");
  expect(destination.pathname).toBe("/en/login");
  expect([...destination.searchParams.keys()].sort()).toEqual(["handoff", "src"]);
  expect(destination.search).not.toContain("89");
  expect(destination.search).not.toContain("191");
  cleanup();
  const login = render(<LoginPage />);
  await waitFor(() => expect(screen.getByText(/89\.5/)).toBeTruthy());
  state.authenticated = true;
  login.rerender(<LoginPage />);
  await waitFor(() => expect(state.push).toHaveBeenCalledWith("/en/welcome"));
  const rows: Record<string, Record<string, unknown>[]> = {};
  const db = {
    query: (table: string) => ({ withIndex: () => ({ unique: async () => rows[table]?.[0] ?? null,
      collect: async () => rows[table] ?? [] }) }),
    insert: async (table: string, value: Record<string, unknown>) => {
      const id = `${table}_1`;
      (rows[table] ??= []).push({ _id: id, ...value });
      return id;
    },
  };
  const result = await (importHandoff as unknown as {
    _handler: (ctx: unknown, args: unknown) => Promise<{ status: string }>;
  })._handler({ db }, { records: readHandoff().entries });
  expect(result.status).toBe("imported");
  expect(rows.profiles[0]).toMatchObject({ userId: "handoff_user", inseamCm: 89.5, heightCm: 191 });
  expect(rows.profileObservations).toEqual(expect.arrayContaining([
    expect.objectContaining({ field: "inseamCm", source: "public_handoff", kind: "measured", value: 89.5 }),
    expect.objectContaining({ field: "heightCm", source: "public_handoff", kind: "declared", value: 191 }),
  ]));
});
