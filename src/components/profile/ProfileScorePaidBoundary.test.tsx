// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProfileScorePaidBoundary } from "./ProfileScorePaidBoundary";
const state = vi.hoisted(() => ({ access: { enforced: false, profileScoreCap: 100 } }));
vi.mock("@/hooks/useProfileAccess", () => ({ useProfileAccess: () => state }));
afterEach(cleanup);
it("shows a priced boundary only for an actually capped account", () => {
  const view = render(<ProfileScorePaidBoundary locale="nl" />);
  expect(view.container.querySelector('[data-boundary="profile-score"]')).toBeNull();
  state.access = { enforced: true, profileScoreCap: 100 };
  view.rerender(<ProfileScorePaidBoundary locale="nl" />);
  expect(view.container.querySelector('[data-boundary="profile-score"]')).toBeNull();
  state.access = { enforced: true, profileScoreCap: 80 };
  view.rerender(<ProfileScorePaidBoundary locale="nl" />);
  expect(view.container.querySelector('[data-boundary="profile-score"]')).toBeTruthy();
  expect(view.container.textContent).toContain("13,50");
  expect(view.container.textContent).toContain("21,50");
});
