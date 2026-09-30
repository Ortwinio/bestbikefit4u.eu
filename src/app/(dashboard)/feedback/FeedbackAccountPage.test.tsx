/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { FeedbackAccountPage } from "./FeedbackAccountPage";
import { getFeedbackCopy } from "@/components/feedback/feedback-copy";
const state = vi.hoisted(() => ({
  tab: "mine",
  loading: false,
  empty: false,
  filledMine: false,
  vote: vi.fn(),
  open: vi.fn(),
  replace: vi.fn(),
}));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: "nl" }) }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/nl/feedback",
  useRouter: () => ({ replace: state.replace }),
  useSearchParams: () => new URLSearchParams({ tab: state.tab }),
}));
vi.mock("@/components/feedback/FeedbackPanelProvider", () => ({
  useFeedbackPanel: () => ({ openPanel: state.open }),
}));
vi.mock("@/components/feedback/FeedbackDetailDialog", () => ({ FeedbackDetailDialog: () => null }));
vi.mock("convex/react", () => ({
  useMutation: () => state.vote,
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => {
    if (state.loading) return undefined;
    if ((getFunctionName(reference).endsWith("getFeatureBoard") ||
      (state.filledMine && getFunctionName(reference).endsWith("getMyFeedback"))) && !state.empty)
      return [
        {
          _id: "idea-1",
          title: "Test idea",
          description: "A requested improvement",
          type: "feature_request",
          status: "planned",
          createdAt: 1700000000000,
          hasUpvoted: false,
          upvoteCount: 3,
        },
      ];
    return [];
  },
}));
beforeEach(() => {
  state.tab = "mine";
  state.loading = false;
  state.empty = false;
  state.filledMine = false;
  state.vote.mockReset();
  state.open.mockReset();
  state.replace.mockReset();
});
afterEach(cleanup);
const copy = getFeedbackCopy("nl");
describe("account feedback presentation", () => {
  it("keeps a single-line thread title target at least 44px", () => {
    state.filledMine = true;
    render(<FeedbackAccountPage />);
    expect(screen.getByRole("button", { name: "Test idea" }).classList.contains("min-h-11")).toBe(true);
  });
  it("shows real loading and empty states and opens the existing feedback panel", () => {
    state.loading = true;
    const { rerender } = render(<FeedbackAccountPage />);
    expect(screen.getByText(copy.states.loading)).toBeTruthy();
    state.loading = false;
    rerender(<FeedbackAccountPage />);
    expect(screen.getByText(copy.states.emptyMineTitle)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: copy.page.primaryCta }));
    expect(state.open).toHaveBeenCalledWith({ defaultType: undefined, pagePath: "/nl/feedback" });
  });
  it("preserves the vote mutation payload and shows a failed vote", async () => {
    state.tab = "board";
    state.vote.mockRejectedValue(new Error("Offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<FeedbackAccountPage />);
    const vote = screen.getByRole("button", { name: copy.actions.upvote });
    expect(vote).toBeTruthy();
    fireEvent.click(vote!);
    await waitFor(() => expect(state.vote).toHaveBeenCalledWith({ feedbackItemId: "idea-1" }));
    await waitFor(() => expect(screen.getByText(copy.states.voteError)).toBeTruthy());
    vi.restoreAllMocks();
  });
});
