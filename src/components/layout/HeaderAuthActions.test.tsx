/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderAuthActions } from "./HeaderAuthActions";

const useConvexAuthMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => useConvexAuthMock(),
}));

vi.mock("@/components/prototyper-ui/ui/button", () => ({
  Button: ({
    children,
    render,
    ...props
  }: {
    children?: React.ReactNode;
    render?: React.ReactElement;
    [key: string]: unknown;
  }) =>
    render ? (
      <a {...(render.props as object)} {...props}>
        {children}
      </a>
    ) : (
      <button {...props}>{children}</button>
    ),
}));

vi.mock("@/components/auth/UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu">User menu</div>,
}));

beforeEach(() => {
  useConvexAuthMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HeaderAuthActions", () => {
  it("shows login and get started actions for signed-out users", () => {
    useConvexAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: false });

    render(
      <HeaderAuthActions
        locale="en"
        loginLabel="Log in"
        getStartedLabel="Start free"
        dashboardLabel="Dashboard"
      />
    );

    expect(screen.getByRole("link", { name: "Log in" }).getAttribute("href")).toBe("/en/login");
    expect(screen.getByRole("link", { name: "Start free" }).getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
  });

  it("shows dashboard access and user menu for signed-in users", () => {
    useConvexAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });

    render(
      <HeaderAuthActions
        locale="en"
        loginLabel="Log in"
        getStartedLabel="Start free"
        dashboardLabel="Dashboard"
      />
    );

    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/en/dashboard");
    expect(screen.getByTestId("user-menu")).toBeTruthy();
  });
});
