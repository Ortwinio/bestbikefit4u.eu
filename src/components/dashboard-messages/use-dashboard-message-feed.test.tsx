import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { useQueryMock, useMutationMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(() => []),
  useMutationMock: vi.fn(() => vi.fn()),
}));

vi.mock("convex/react", () => ({
  useQuery: useQueryMock,
  useMutation: useMutationMock,
}));

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: "nl",
    messages: {},
    languageSwitchLabels: {},
  }),
}));

import { api } from "@/../convex/_generated/api";
import { useDashboardMessageFeed } from "./use-dashboard-message-feed";

function Probe() {
  useDashboardMessageFeed();
  return null;
}

describe("useDashboardMessageFeed", () => {
  it("forwards the active locale to getMyMessages", () => {
    renderToStaticMarkup(<Probe />);
    expect(useQueryMock).toHaveBeenCalledWith(api.messages.queries.getMyMessages, {
      locale: "nl",
    });
  });
});
