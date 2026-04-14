import { describe, expect, it } from "vitest";

import { isGuideAdminRole } from "./guide-admin-shared";

describe("guide admin role checks", () => {
  it("allows super admins to manage guide admin actions", () => {
    expect(isGuideAdminRole("super_admin")).toBe(true);
  });

  it("allows guide admin roles and rejects non-guide roles", () => {
    expect(isGuideAdminRole("ops_admin")).toBe(true);
    expect(isGuideAdminRole("fit_specialist")).toBe(true);
    expect(isGuideAdminRole("qa_manager")).toBe(true);
    expect(isGuideAdminRole("support_admin")).toBe(false);
    expect(isGuideAdminRole("analyst")).toBe(false);
  });
});
