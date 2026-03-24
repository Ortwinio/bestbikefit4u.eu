import { describe, expect, it } from "vitest";
import {
  canAccessAdminRoute,
  getRequiredAdminRoles,
} from "./admin-route-access";

describe("admin route access", () => {
  it("maps route prefixes to required roles", () => {
    expect(getRequiredAdminRoles("/admin/settings")).toEqual([
      "super_admin",
      "ops_admin",
    ]);
    expect(getRequiredAdminRoles("/admin/users/abc")).toEqual([
      "super_admin",
      "ops_admin",
      "support_admin",
      "analyst",
    ]);
  });

  it("allows and denies access by role", () => {
    expect(canAccessAdminRoute("/admin/settings", "super_admin")).toBe(true);
    expect(canAccessAdminRoute("/admin/settings", "ops_admin")).toBe(true);
    expect(canAccessAdminRoute("/admin/settings", "support_admin")).toBe(false);
    expect(canAccessAdminRoute("/admin/overview", "analyst")).toBe(true);
    expect(canAccessAdminRoute("/admin/licenses", "billing_admin")).toBe(true);
    expect(canAccessAdminRoute("/admin/licenses", "geometry_manager")).toBe(false);
  });
});
