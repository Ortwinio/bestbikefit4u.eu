import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({
  convexAuthNextjsToken: vi.fn(async () => undefined),
}));
vi.mock("convex/nextjs", () => ({
  fetchQuery: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import {
  formatAdminRoleLabel,
  isAdminRole,
} from "./admin-auth-shared";
import {
  getAdminNavigationItem,
  isAdminNavigationActive,
} from "../layout/admin-navigation";

describe("admin session helpers", () => {
  it("recognizes valid admin roles", () => {
    expect(isAdminRole("super_admin")).toBe(true);
    expect(isAdminRole("ops_admin")).toBe(true);
    expect(isAdminRole("user")).toBe(false);
  });

  it("formats admin role labels for display", () => {
    expect(formatAdminRoleLabel("fit_specialist")).toBe("fit specialist");
  });
});

describe("admin navigation helpers", () => {
  it("detects active admin routes", () => {
    expect(isAdminNavigationActive("/admin/overview", "/admin/overview")).toBe(true);
    expect(isAdminNavigationActive("/admin/overview/reports", "/admin/overview")).toBe(true);
    expect(isAdminNavigationActive("/admin/fit-engine", "/admin/overview")).toBe(false);
  });

  it("returns the matching navigation item", () => {
    expect(getAdminNavigationItem("/admin/fit-runs")?.href).toBe("/admin/fit-runs");
    expect(getAdminNavigationItem("/admin/guides/new")?.href).toBe("/admin/guides");
  });
});
