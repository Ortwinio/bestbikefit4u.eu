// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ToastProvider } from "./Toast";
const state = vi.hoisted(() => ({ path: "/nl/gearing" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));
afterEach(cleanup);
it.each([["nl", "Meldingen"], ["en", "Notifications"]])("labels the toast viewport in %s", (locale, label) => {
  state.path = `/${locale}/gearing`;
  render(<ToastProvider><span>Content</span></ToastProvider>);
  expect(screen.getByLabelText(label)).toBeTruthy();
});
